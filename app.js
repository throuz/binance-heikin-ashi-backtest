import { getHistoryData } from "./history/history.js";
import {
  AVERAGE_VOLUME_THRESHOLD_FACTOR,
  INITIAL_FUNDING,
  LEVERAGE,
  FEE,
  FUNDING_RATE
} from "./config/config.js";
import {
  getFundingFee,
  getFundingFeeTimes,
  getDailyPNLPercentage
} from "./src/helpers.js";

const needLastest = true;
const historyData = await getHistoryData(needLastest);

let isLiquidation = false;

let fund = INITIAL_FUNDING;
let hasPosition = false;
let startPositionTimestamp = null;
let openPrice = null;
let liquidationPrice = null;
let valueOfEachPoint = null;

for (let i = 1; i < historyData.length; i++) {
  const previousData = historyData[i - 1];
  const currentData = historyData[i];
  // Buy
  if (
    !hasPosition &&
    fund > 0 &&
    previousData.heikinAshiData.close > previousData.heikinAshiData.open &&
    currentData.heikinAshiData.previousLongTermTrend === "up" &&
    previousData.realData.volume <
      previousData.realData.previousAverageVolume *
        (1 - AVERAGE_VOLUME_THRESHOLD_FACTOR)
  ) {
    const positionFund = 0.99 * fund; // Actual tests have found that if use 100% fund to place an order, typically only 99% fund be used.
    const fee = positionFund * LEVERAGE * FEE;
    fund = fund - fee;
    hasPosition = true;
    startPositionTimestamp = currentData.realData.openTime;
    openPrice = currentData.realData.open;
    liquidationPrice = openPrice * ((LEVERAGE - 1) / LEVERAGE + 0.01); // Actual tests have found that typically 1% more
    valueOfEachPoint = (positionFund * LEVERAGE) / openPrice;
  }
  // Liquidation
  if (hasPosition && currentData.realData.low < liquidationPrice) {
    isLiquidation = true;
    console.log("--------------------------------------------");
    console.log("Liquidation");
    break;
  }
  // Sell
  if (
    (hasPosition &&
      previousData.heikinAshiData.close < previousData.heikinAshiData.open &&
      previousData.realData.volume >
        previousData.realData.previousAverageVolume *
          (1 + AVERAGE_VOLUME_THRESHOLD_FACTOR)) ||
    (hasPosition &&
      currentData.heikinAshiData.previousLongTermTrend === "down") ||
    (hasPosition && i === historyData.length - 1)
  ) {
    const closePrice = currentData.realData.open;
    const priceDifference = closePrice - openPrice;
    fund = fund + valueOfEachPoint * priceDifference;
    const positionFund = 0.99 * fund; // Actual tests have found that if use 100% fund to place an order, typically only 99% fund be used.
    const fee = positionFund * LEVERAGE * FEE;
    const fundingFee = getFundingFee(
      positionFund,
      startPositionTimestamp,
      currentData.realData.openTime
    );
    fund = fund - fee - fundingFee;
    hasPosition = false;
    startPositionTimestamp = null;
    openPrice = null;
    liquidationPrice = null;
    valueOfEachPoint = null;
    console.log("Fund:", fund.toFixed(2));
  }
}

if (!isLiquidation) {
  const firstData = historyData[0].realData;
  const finalData = historyData[historyData.length - 1].realData;
  const firstPrice = firstData.close;
  const finalPrice = finalData.close;
  const fundingFeeTimes = getFundingFeeTimes(
    firstData.openTime,
    finalData.openTime
  );
  const lowestPrice = Math.min(...historyData.map((data) => data.realData.low));
  const isHoldWithLeverageLiquidation =
    (lowestPrice / firstPrice - 1 - FUNDING_RATE * fundingFeeTimes) *
      LEVERAGE *
      100 <
    -100;
  const holdPNLPercentage = (finalPrice / firstPrice - 1) * 100;
  const holdWithLeveragePNLPercentage = isHoldWithLeverageLiquidation
    ? -100
    : (finalPrice / firstPrice - 1 - FUNDING_RATE * fundingFeeTimes) *
      LEVERAGE *
      100;
  const tradePNLPercentage = (fund / INITIAL_FUNDING - 1) * 100;
  const dailyTradePNLPercentage = getDailyPNLPercentage(
    tradePNLPercentage,
    firstData.openTime,
    finalData.closeTime
  );
  console.log("--------------------------------------------");
  console.log("Running Period:", historyData.length);
  console.log("Hold PNL Percentage:", holdPNLPercentage.toFixed(2) + "%");
  console.log(
    "Hold With Leverage PNL Percentage:",
    holdWithLeveragePNLPercentage.toFixed(2) + "%"
  );
  console.log("Trade PNL Percentage:", tradePNLPercentage.toFixed(2) + "%");
  console.log(
    "Daily Trade PNL Percentage:",
    dailyTradePNLPercentage.toFixed(2) + "%"
  );
}
