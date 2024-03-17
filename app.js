import { getHistoryData } from "./history/history.js";
import { INITIAL_FUNDING, LEVERAGE } from "./configs/trade-config.js";

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
    hasPosition = true;
    openPrice = (currentData.open + currentData.close) / 2;
    liquidationPrice = openPrice * ((LEVERAGE - 1) / LEVERAGE);
    valueOfEachPoint = (fund * LEVERAGE) / openPrice;
  }
  // Liquidation
  if (hasPosition && currentData.low < liquidationPrice) {
    isLiquidation = true;
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
    console.log(
      Math.floor(fund),
      Math.floor(openPrice),
      Math.floor(closePrice),
      Math.floor(valueOfEachPoint * priceDifference)
    );
    hasPosition = false;
    openPrice = null;
    liquidationPrice = null;
    valueOfEachPoint = null;
  }
}

if (!isLiquidation) {
  const onlyHoldMultiples =
    (historyData[historyData.length - 1].close / historyData[0].close) *
    LEVERAGE;
  const finalMultiples = fund / INITIAL_FUNDING;
  if (finalMultiples > onlyHoldMultiples) {
    console.log(
      "Is a good strategy",
      Math.floor(onlyHoldMultiples),
      Math.floor(finalMultiples)
    );
  } else {
    console.log(
      "Is a bad strategy",
      Math.floor(onlyHoldMultiples),
      Math.floor(finalMultiples)
    );
  }
}
