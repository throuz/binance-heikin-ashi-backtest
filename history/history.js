import { readFile, writeFile } from "node:fs/promises";
import { getKlineData, getHeikinAshiKlineData } from "../src/helpers.js";
import { SYMBOL, LONG_TERM_KLINE_INTERVAL } from "../config/config.js";

let klineData = [];
let heikinAshiKlineData = [];
let longTermHeikinAshiKlineData = [];

const klineDataFilePath = new URL(
  `./json/${SYMBOL}-kline.json`,
  import.meta.url
);
const heikinAshiKlineDataFilePath = new URL(
  `./json/${SYMBOL}-heikin-ashi-kline.json`,
  import.meta.url
);
const longTermHeikinAshiKlineDataFilePath = new URL(
  `./json/${SYMBOL}-long-term-heikin-ashi-kline.json`,
  import.meta.url
);

export const setHistoryData = async () => {
  klineData = await getKlineData();
  heikinAshiKlineData = await getHeikinAshiKlineData();
  longTermHeikinAshiKlineData = await getHeikinAshiKlineData(
    LONG_TERM_KLINE_INTERVAL
  );
  await writeFile(klineDataFilePath, JSON.stringify(klineData, undefined, 2));
  await writeFile(
    heikinAshiKlineDataFilePath,
    JSON.stringify(heikinAshiKlineData, undefined, 2)
  );
  await writeFile(
    longTermHeikinAshiKlineDataFilePath,
    JSON.stringify(longTermHeikinAshiKlineData, undefined, 2)
  );
};

export const getHistoryData = () => {
  return { klineData, heikinAshiKlineData, longTermHeikinAshiKlineData };
};
