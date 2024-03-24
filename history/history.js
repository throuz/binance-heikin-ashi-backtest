import { readFile, writeFile } from "node:fs/promises";
import {
  getKlineData,
  getOrganizedHeikinAshiKlineData
} from "../src/helpers.js";
import { SYMBOL } from "../config/config.js";

const filePath = new URL(`./json/${SYMBOL}.json`, import.meta.url);

const convertHistoryData = (kLineData, heikinAshiKlineData) => {
  const results = [];
  for (let i = 0; i < kLineData.length; i++) {
    if (kLineData[i].prevPeriodAvgVolume) {
      results.push({
        realData: kLineData[i],
        heikinAshiData: heikinAshiKlineData[i]
      });
    }
  }
  return results;
};

export const getHistoryData = async (needLastest) => {
  if (needLastest) {
    const klineData = await getKlineData();
    const heikinAshiKlineData = await getOrganizedHeikinAshiKlineData();
    const historyData = convertHistoryData(klineData, heikinAshiKlineData);
    await writeFile(filePath, JSON.stringify(historyData, undefined, 2));
    return historyData;
  }
  const contents = await readFile(filePath, { encoding: "utf8" });
  const historyData = JSON.parse(contents);
  return historyData;
};
