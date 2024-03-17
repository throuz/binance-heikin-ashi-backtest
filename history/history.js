import { readFile, writeFile } from "node:fs/promises";
import { getHeikinAshiKLineData } from "../src/helpers.js";

const filePath = new URL("./history.json", import.meta.url);

const convertSuitableKLineData = (kLineData) => {
  const results = [];
  for (let i = 0; i < kLineData.open.length; i++) {
    results.push({
      open: kLineData.open[i],
      close: kLineData.close[i],
      high: kLineData.high[i],
      low: kLineData.low[i]
    });
  }
  return results;
};

export const getHistoryData = async (needLastest) => {
  if (needLastest) {
    const heikinAshiKLineData = await getHeikinAshiKLineData();
    const suitableKLineData = convertSuitableKLineData(heikinAshiKLineData);
    await writeFile(filePath, JSON.stringify(suitableKLineData, undefined, 2));
    return suitableKLineData;
  }
  const contents = await readFile(filePath, { encoding: "utf8" });
  const historyData = JSON.parse(contents);
  return historyData;
};
