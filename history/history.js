import { readFile, writeFile } from "node:fs/promises";
import { getHeikinAshiKLineData, getSmaData } from "../src/helpers.js";
import { KLINE_LIMIT } from "../configs/trade-config.js";

const filePath = new URL("./history.json", import.meta.url);

const convertSuitableKLineData = (kLineData, smaData) => {
  const results = [];
  for (let i = 0; i < KLINE_LIMIT; i++) {
    results.push({
      open: kLineData.open[i],
      close: kLineData.close[i],
      high: kLineData.high[i],
      low: kLineData.low[i],
      sma: smaData[i]
    });
  }
  return results;
};

export const getHistoryData = async (needLastest) => {
  if (needLastest) {
    const heikinAshiKLineData = await getHeikinAshiKLineData();
    const smaData = await getSmaData();
    const suitableKLineData = convertSuitableKLineData(
      heikinAshiKLineData,
      smaData
    );
    await writeFile(filePath, JSON.stringify(suitableKLineData, undefined, 2));
    return suitableKLineData;
  }
  const contents = await readFile(filePath, { encoding: "utf8" });
  const historyData = JSON.parse(contents);
  return historyData;
};
