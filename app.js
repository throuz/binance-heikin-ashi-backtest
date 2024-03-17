import { getHistoryData } from "./history/history.js";
import { INITIAL_FUNDING, LEVERAGE, FEE } from "./configs/trade-config.js";

const needLastest = true;
const historyData = await getHistoryData(needLastest);

let isLiquidation = false;

let fund = INITIAL_FUNDING;
let hasPosition = false;
let openPrice = null;
let liquidationPrice = null;
let valueOfEachPoint = null;

for (let i = 1; i < historyData.length; i++) {
  const previousData = historyData[i - 1];
  const currentData = historyData[i];
  // Buy
  if (!hasPosition && fund > 0 && previousData.close > previousData.open) {
    const positionFund = 0.99 * fund; // Actual tests have found that if use 100% fund to place an order, typically only 99% fund be used.
    hasPosition = true;
    openPrice = (currentData.open + currentData.close) / 2;
    liquidationPrice = openPrice * ((LEVERAGE - 1) / LEVERAGE + 0.01); // Actual tests have found that typically 1% more
    valueOfEachPoint = (positionFund * LEVERAGE) / openPrice;
    const fee = positionFund * LEVERAGE * FEE;
    fund = fund - fee;
  }
  // Liquidation
  if (hasPosition && currentData.low < liquidationPrice) {
    isLiquidation = true;
    console.log("--------------------------------------------");
    console.log("Liquidation");
    break;
  }
  // Sell
  if (
    (hasPosition && previousData.close < previousData.open) ||
    (hasPosition && i === historyData.length - 1)
  ) {
    const closePrice = (currentData.open + currentData.close) / 2;
    const priceDifference = closePrice - openPrice;
    fund = fund + valueOfEachPoint * priceDifference;
    hasPosition = false;
    openPrice = null;
    liquidationPrice = null;
    valueOfEachPoint = null;
    const positionFund = 0.99 * fund; // Actual tests have found that if use 100% fund to place an order, typically only 99% fund be used.
    const fee = positionFund * LEVERAGE * FEE;
    fund = fund - fee;
    console.log("Fund:", fund.toFixed(2));
  }
}

if (!isLiquidation) {
  const holdPNLPercentage =
    (historyData[historyData.length - 1].close / historyData[0].close - 1) *
    LEVERAGE *
    100;
  const finalPNLPercentage = (fund / INITIAL_FUNDING - 1) * 100;
  const result = finalPNLPercentage > holdPNLPercentage ? "good" : "bad";
  console.log("--------------------------------------------");
  console.log("Running Period:", historyData.length);
  console.log("Hold PNL Percentage:", holdPNLPercentage.toFixed(2) + "%");
  console.log("Final PNL Percentage:", finalPNLPercentage.toFixed(2) + "%");
  console.log("Result:", result);
}
