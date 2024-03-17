import {
  SYMBOL,
  KLINE_INTERVAL,
  KLINE_LIMIT,
  KLINE_START_TIME,
  KLINE_END_TIME
} from "../configs/trade-config.js";
import { markPriceKlineDataAPI } from "./api.js";
import { heikinashi } from "technicalindicators";

export const getMarkPriceKlineData = async () => {
  const totalParams = {
    symbol: SYMBOL,
    interval: KLINE_INTERVAL,
    limit: KLINE_LIMIT,
    startTime: KLINE_START_TIME,
    endTime: KLINE_END_TIME
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
