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
  return klineData;
};

export const getMarkPriceKlineData = async () => {
  const params = {
    symbol: SYMBOL,
    interval: KLINE_INTERVAL,
    limit: KLINE_LIMIT,
    startTime: KLINE_START_TIME,
    endTime: KLINE_END_TIME
  };
  const markPriceKlineData = await markPriceKlineDataAPI(params);
  return markPriceKlineData;
};

export const getHeikinAshiKlineData = async () => {
  const markPriceKlineData = await getMarkPriceKlineData();
  const timestamps = markPriceKlineData.map((kline) => Number(kline[0]));
  const openPrices = markPriceKlineData.map((kline) => Number(kline[1]));
  const highPrices = markPriceKlineData.map((kline) => Number(kline[2]));
  const lowPrices = markPriceKlineData.map((kline) => Number(kline[3]));
  const closePrices = markPriceKlineData.map((kline) => Number(kline[4]));
  return heikinashi({
    open: openPrices,
    high: highPrices,
    low: lowPrices,
    close: closePrices,
    timestamp: timestamps
  });
};
