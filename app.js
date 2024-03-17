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
    console.log({
      fund: Math.floor(fund),
      openPrice: Math.floor(openPrice),
      closePrice: Math.floor(closePrice),
      result: Math.floor(valueOfEachPoint * priceDifference)
    });
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
  const result =
    finalMultiples > onlyHoldMultiples
      ? "Is a good strategy"
      : "Is a bad strategy";
  console.log({
    result: result,
    runningDays: historyData.length,
    onlyHoldMultiples: Math.floor(onlyHoldMultiples),
    finalMultiples: Math.floor(finalMultiples)
  });
}
