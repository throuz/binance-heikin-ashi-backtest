import { getHistoryData } from "./history/history.js";
import { INITIAL_FUNDING, LEVERAGE } from "./configs/trade-config.js";

const needLastest = true;
const historyData = await getHistoryData(needLastest);

let fund = INITIAL_FUNDING;
let hasPosition = false;
let openPrice = null;
let stopLossPrice = null;
let liquidationPrice = null;
let valueOfEachPoint = null;

for (let i = 1; i < historyData.length; i++) {
  const previousData = historyData[i - 1];
  const currentData = historyData[i];
  // Buy
  if (
    !hasPosition &&
    fund > 0 &&
    previousData.close > previousData.open &&
    !!currentData.sma &&
    currentData.close > currentData.sma
  ) {
    hasPosition = true;
    openPrice = currentData.close;
    stopLossPrice = previousData.low;
    liquidationPrice = openPrice * ((LEVERAGE - 1) / LEVERAGE);
    valueOfEachPoint = (fund * LEVERAGE) / openPrice;
  }
  // Liquidation
  if (hasPosition && currentData.low < liquidationPrice) {
    console.log("Liquidation");
    break;
  }
  // Stop loss
  // if (hasPosition && currentData.low < stopLossPrice) {
  //   const priceDifference = stopLossPrice - openPrice;
  //   fund = fund + valueOfEachPoint * priceDifference;
  //   console.log(
  //     Math.floor(fund),
  //     "Stop loss",
  //     Math.floor(valueOfEachPoint * priceDifference)
  //   );
  //   hasPosition = false;
  //   openPrice = null;
  //   stopLossPrice = null;
  //   liquidationPrice = null;
  //   valueOfEachPoint = null;
  // }
  // Sell
  if (
    (hasPosition && previousData.close < previousData.open) ||
    (hasPosition && i === historyData.length - 1)
  ) {
    const closePrice = currentData.close;
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
    stopLossPrice = null;
    liquidationPrice = null;
    valueOfEachPoint = null;
  }
}

const onlyHoldMultiples =
  (historyData[historyData.length - 1].close / historyData[0].close) * 5;
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
