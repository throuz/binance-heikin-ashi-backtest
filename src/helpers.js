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
  const getPrevPeriodAvgVolume = (i) => {
    if (i >= PREVIOUS_AVERAGE_VOLUME_PERIOD) {
      const sumVolume = volumeArray
        .slice(i - PREVIOUS_AVERAGE_VOLUME_PERIOD, i)
        .reduce((acc, volume) => volume + acc, 0);
      const prevPeriodAvgVolume = sumVolume / PREVIOUS_AVERAGE_VOLUME_PERIOD;
      return prevPeriodAvgVolume;
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
    prevPeriodAvgVolume: getPrevPeriodAvgVolume(i)
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

export const getOrganizedHeikinAshiKlineData = async () => {
  const shortTermData = await getHeikinAshiKlineData();
  const longTermData = await getHeikinAshiKlineData(LONG_TERM_KLINE_INTERVAL);
  const getPrevTrendByTimestamp = (timestamp) => {
    for (let i = 1; i < longTermData.length; i++) {
      const prevData = longTermData[i - 1];
      const curData = longTermData[i];
      if (timestamp >= curData.openTime && timestamp <= curData.closeTime) {
        return prevData.close > prevData.open ? "up" : "down";
      }
    }
  };
  const results = shortTermData.map((kline) => ({
    ...kline,
    prevLongTermTrend: getPrevTrendByTimestamp(kline.openTime)
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

const getDaysBetweenTimestamp = (startTimestamp, endTimeStamp) => {
  const timeDifference = endTimeStamp - startTimestamp;
  const oneDayMs = 1000 * 60 * 60 * 24;
  const days = timeDifference / oneDayMs;
  return days;
};

export const getDailyPNLPercentage = (
  PNLPercentage,
  startTimestamp,
  endTimeStamp
) => {
  const days = getDaysBetweenTimestamp(startTimestamp, endTimeStamp);
  const dailyPNLPercentage =
    (Math.pow(1 + PNLPercentage / 100, 1 / days) - 1) * 100;
  return dailyPNLPercentage;
};

const convertTwoDigitFormat = (number) => {
  if (number < 10) {
    return "0" + String(number);
  }
  return String(number);
};

export const getFormattedTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = convertTwoDigitFormat(date.getMonth() + 1);
  const day = convertTwoDigitFormat(date.getDate());
  const hours = convertTwoDigitFormat(date.getHours());
  const minutes = convertTwoDigitFormat(date.getMinutes());
  const seconds = convertTwoDigitFormat(date.getSeconds());
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedTime;
};
