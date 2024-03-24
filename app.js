import { getHistoryData } from "./history/history.js";
import {
  AVERAGE_VOLUME_THRESHOLD_FACTOR,
  INITIAL_FUNDING,
  EACH_TIME_INVEST_FUND_PERCENTAGE,
  LEVERAGE,
  FEE,
  FUNDING_RATE
} from "./config/config.js";
import {
  getFundingFee,
  getFundingFeeTimes,
  getDailyPNLPercentage,
  getFormattedTime
} from "./src/helpers.js";

const needLastest = true;
const historyData = await getHistoryData(needLastest);

let isLiquidation = false;

let maxProfitPercentagePerTrade = 0;
let maxLossPercentagePerTrade = 0;

let fund = INITIAL_FUNDING;
let positionFund = null;
let hasPosition = false;
let startPositionTimestamp = null;
let openPrice = null;
let liquidationPrice = null;
let valueOfEachPoint = null;

let highestFund = fund;
let lowestFund = fund;

for (let i = 1; i < historyData.length; i++) {
  const prevData = historyData[i - 1];
  const curData = historyData[i];
  // Buy
  if (
    !hasPosition &&
    fund > 0 &&
    prevData.heikinAshiData.close > prevData.heikinAshiData.open &&
    curData.heikinAshiData.prevLongTermTrend === "up" &&
    prevData.realData.volume <
      prevData.realData.prevPeriodAvgVolume *
        (1 - AVERAGE_VOLUME_THRESHOLD_FACTOR)
  ) {
    positionFund = fund * ((EACH_TIME_INVEST_FUND_PERCENTAGE - 1) / 100); // Actual tests have found that typically 1% less
    const fee = positionFund * LEVERAGE * FEE;
    fund = fund - fee;
    hasPosition = true;
    startPositionTimestamp = curData.realData.openTime;
    openPrice = curData.realData.open;
    liquidationPrice = openPrice * ((LEVERAGE - 1) / LEVERAGE + 0.01); // Actual tests have found that typically 1% more
    valueOfEachPoint = (positionFund * LEVERAGE) / openPrice;
  }
  // Liquidation
  if (hasPosition && curData.realData.low < liquidationPrice) {
    isLiquidation = true;
    console.log("--------------------------------------------");
    console.log("Liquidation");
    break;
  }
  // Sell
  if (
    (hasPosition &&
      prevData.heikinAshiData.close < prevData.heikinAshiData.open &&
      prevData.realData.volume >
        prevData.realData.prevPeriodAvgVolume *
          (1 + AVERAGE_VOLUME_THRESHOLD_FACTOR)) ||
    (hasPosition && curData.heikinAshiData.prevLongTermTrend === "down") ||
    (hasPosition && i === historyData.length - 1)
  ) {
    const closePrice = curData.realData.open;
    const priceDifference = closePrice - openPrice;
    const pnl = valueOfEachPoint * priceDifference;
    const pnlPercentage = (pnl / positionFund) * 100;
    if (pnlPercentage > maxProfitPercentagePerTrade) {
      maxProfitPercentagePerTrade = pnlPercentage;
    }
    if (pnlPercentage < maxLossPercentagePerTrade) {
      maxLossPercentagePerTrade = pnlPercentage;
    }
    positionFund += pnl;
    const fee = positionFund * LEVERAGE * FEE;
    const fundingFee = getFundingFee(
      positionFund,
      startPositionTimestamp,
      curData.realData.openTime
    );
    fund = fund + pnl - fee - fundingFee;
    const openPositionTime = getFormattedTime(startPositionTimestamp);
    const closePositionTime = getFormattedTime(curData.realData.openTime);
    console.log(
      "Fund:",
      fund.toFixed(2),
      `[${openPrice} ~ ${closePrice}]`,
      `[${openPositionTime} ~ ${closePositionTime}]`
    );
    positionFund = null;
    hasPosition = false;
    startPositionTimestamp = null;
    openPrice = null;
    liquidationPrice = null;
    valueOfEachPoint = null;
    if (fund > highestFund) {
      highestFund = fund;
    }
    if (fund < lowestFund) {
      lowestFund = fund;
    }
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
  const highestTradePNLPercentage = (highestFund / INITIAL_FUNDING - 1) * 100;
  const lowestTradePNLPercentage = (lowestFund / INITIAL_FUNDING - 1) * 100;
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
  console.log(
    "Highest Trade PNL Percentage:",
    highestTradePNLPercentage.toFixed(2) + "%"
  );
  console.log(
    "Lowest Trade PNL Percentage:",
    lowestTradePNLPercentage.toFixed(2) + "%"
  );
  console.log(
    "Max Profit Percentage Per Trade:",
    maxProfitPercentagePerTrade.toFixed(2) + "%"
  );
  console.log(
    "Max Loss Percentage Per Trade:",
    maxLossPercentagePerTrade.toFixed(2) + "%"
  );
}
