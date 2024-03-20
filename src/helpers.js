import {
  SYMBOL,
  LONG_TERM_KLINE_INTERVAL,
  KLINE_INTERVAL,
  KLINE_LIMIT,
  KLINE_START_TIME,
  KLINE_END_TIME,
  PREVIOUS_AVERAGE_VOLUME_PERIOD,
  FUNDING_RATE
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
  const volumeArray = klineData.map((kline) => Number(kline[5]));
  const getPreviousAverageVolume = (i) => {
    if (i >= PREVIOUS_AVERAGE_VOLUME_PERIOD) {
      const sumVolume = volumeArray
        .slice(i - PREVIOUS_AVERAGE_VOLUME_PERIOD, i)
        .reduce((acc, volume) => volume + acc, 0);
      const previousAverageVolume = sumVolume / PREVIOUS_AVERAGE_VOLUME_PERIOD;
      return previousAverageVolume;
    }
    return null;
  };
  const results = klineData.map((kline, i) => ({
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5]),
    openTime: kline[0],
    closeTime: kline[6],
    previousAverageVolume: getPreviousAverageVolume(i)
  }));
  return results;
};

const getHeikinAshiKlineData = async (interval = KLINE_INTERVAL) => {
  const params = {
    symbol: SYMBOL,
    interval: interval,
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

export const getOptimizedHeikinAshiKlineData = async () => {
  const shortTermData = await getHeikinAshiKlineData();
  const longTermData = await getHeikinAshiKlineData(LONG_TERM_KLINE_INTERVAL);
  const getPreviousTrendByTimestamp = (timestamp) => {
    for (let i = 1; i < longTermData.length; i++) {
      const previousData = longTermData[i - 1];
      const currentData = longTermData[i];
      if (
        timestamp >= currentData.openTime &&
        timestamp <= currentData.closeTime
      ) {
        return previousData.close > previousData.open ? "up" : "down";
      }
    }
  };
  const results = shortTermData.map((kline) => ({
    ...kline,
    previousLongTermTrend: getPreviousTrendByTimestamp(kline.openTime)
  }));
  return results;
};

export const getFundingFeeTimes = (startTimeStamp, endTimeStamp) => {
  const timeDifference = endTimeStamp - startTimeStamp;
  const hours = timeDifference / (1000 * 60 * 60);
  const times = Math.floor(hours / 8);
  return times;
};

export const getFundingFee = (positionFund, startTimeStamp, endTimeStamp) => {
  const times = getFundingFeeTimes(startTimeStamp, endTimeStamp);
  const fundingFee = positionFund * FUNDING_RATE * times;
  return fundingFee;
};
