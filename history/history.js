import { readFile, writeFile } from "node:fs/promises";
import { getKlineData, getHeikinAshiKlineData } from "../src/helpers.js";
import { SYMBOL } from "../configs/trade-config.js";

const filePath = new URL(`./json/${SYMBOL}.json`, import.meta.url);

const convertHistoryData = (kLineData, heikinAshiKlineData) => {
  const results = [];
  for (let i = 0; i < kLineData.length; i++) {
    results.push({
      realData: {
        open: Number(kLineData[i][1]),
        high: Number(kLineData[i][2]),
        low: Number(kLineData[i][3]),
        close: Number(kLineData[i][4]),
        timestamp: Number(kLineData[i][0])
      },
      heikinAshiData: {
        open: heikinAshiKlineData.open[i],
        high: heikinAshiKlineData.high[i],
        low: heikinAshiKlineData.low[i],
        close: heikinAshiKlineData.close[i],
        timestamp: heikinAshiKlineData.timestamp[i]
      }
    });
  }
  return results;
};

export const getHistoryData = async (needLastest) => {
  if (needLastest) {
    const klineData = await getKlineData();
    const heikinAshiKlineData = await getHeikinAshiKlineData();
    const historyData = convertHistoryData(klineData, heikinAshiKlineData);
    await writeFile(filePath, JSON.stringify(historyData, undefined, 2));
    return historyData;
  }
  const contents = await readFile(filePath, { encoding: "utf8" });
  const historyData = JSON.parse(contents);
  return historyData;
};
