import {
  SYMBOL,
  KLINE_INTERVAL,
  KLINE_LIMIT,
  SMA_PERIOD
} from "../configs/trade-config.js";
import { markPriceKlineDataAPI } from "./api.js";
import { heikinashi, sma } from "technicalindicators";

export const getMarkPriceKlineData = async () => {
  const totalParams = {
    symbol: SYMBOL,
    interval: KLINE_INTERVAL,
    limit: KLINE_LIMIT
  };
  const markPriceKlineData = await markPriceKlineDataAPI(totalParams);
  return markPriceKlineData;
};

export const getHeikinAshiKLineData = async () => {
  const markPriceKlineData = await getMarkPriceKlineData();
  const openPrices = markPriceKlineData.map((kline) => Number(kline[1]));
  const highPrices = markPriceKlineData.map((kline) => Number(kline[2]));
  const lowPrices = markPriceKlineData.map((kline) => Number(kline[3]));
  const closePrices = markPriceKlineData.map((kline) => Number(kline[4]));
  return heikinashi({
    open: openPrices,
    high: highPrices,
    low: lowPrices,
    close: closePrices
  });
};

export const getSmaData = async () => {
  const heikinAshiKLineData = await getHeikinAshiKLineData();
  const emptyArray = new Array(SMA_PERIOD - 1).fill(undefined);
  return [
    ...emptyArray,
    ...sma({ period: SMA_PERIOD, values: heikinAshiKLineData.close })
  ];
};
