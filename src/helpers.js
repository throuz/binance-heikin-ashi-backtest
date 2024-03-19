import {
  SYMBOL,
  KLINE_INTERVAL,
  KLINE_LIMIT,
  KLINE_START_TIME,
  KLINE_END_TIME
} from "../config/config.js";
import { klineDataAPI, markPriceKlineDataAPI } from "./api.js";
import { heikinashi } from "technicalindicators";

export const getKlineData = async () => {
  const params = {
    symbol: SYMBOL,
    interval: KLINE_INTERVAL,
    limit: KLINE_LIMIT,
    startTime: KLINE_START_TIME,
    endTime: KLINE_END_TIME
  };
  const klineData = await klineDataAPI(params);
  const results = klineData.map((kline) => ({
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    openTime: kline[0],
    closeTime: kline[6]
  }));
  return results;
};

export const getHeikinAshiKlineData = async () => {
  const params = {
    symbol: SYMBOL,
    interval: KLINE_INTERVAL,
    limit: KLINE_LIMIT,
    startTime: KLINE_START_TIME,
    endTime: KLINE_END_TIME
  };
  const markPriceKlineData = await markPriceKlineDataAPI(params);
  const openPrices = markPriceKlineData.map((kline) => Number(kline[1]));
  const highPrices = markPriceKlineData.map((kline) => Number(kline[2]));
  const lowPrices = markPriceKlineData.map((kline) => Number(kline[3]));
  const closePrices = markPriceKlineData.map((kline) => Number(kline[4]));
  const heikinashiResults = heikinashi({
    open: openPrices,
    high: highPrices,
    low: lowPrices,
    close: closePrices
  });
  const results = markPriceKlineData.map((kline, i) => ({
    open: heikinashiResults.open[i],
    high: heikinashiResults.high[i],
    low: heikinashiResults.low[i],
    close: heikinashiResults.close[i],
    openTime: kline[0],
    closeTime: kline[6]
  }));
  return results;
};
