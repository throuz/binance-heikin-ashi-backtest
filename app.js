import { getBacktestResult } from "./src/backtest.js";
import { setHistoryData } from "./history/history.js";
import cliProgress from "cli-progress";
import { getAddedNumber } from "./src/helpers.js";

await setHistoryData();

const avgVolPeriodSetting = { min: 5, max: 30, step: 1 };
const entryAvgVolFactorSetting = { min: 0.5, max: 1, step: 0.05 };
const exitAvgVolFactorSetting = { min: 1, max: 1.5, step: 0.05 };

const getTotalRuns = () => {
  const avgVolPeriodRuns =
    (avgVolPeriodSetting.max - avgVolPeriodSetting.min) /
      avgVolPeriodSetting.step +
    1;
  const entryAvgVolFactorRuns =
    (entryAvgVolFactorSetting.max - entryAvgVolFactorSetting.min) /
      entryAvgVolFactorSetting.step +
    1;
  const exitAvgVolFactorRuns =
    (exitAvgVolFactorSetting.max - exitAvgVolFactorSetting.min) /
      exitAvgVolFactorSetting.step +
    1;
  return avgVolPeriodRuns * entryAvgVolFactorRuns * exitAvgVolFactorRuns;
};

const getBestResult = () => {
  const progressBar = new cliProgress.SingleBar({});
  progressBar.start(getTotalRuns(), 0);

  let bestResult = { fund: 0, highestFund: 0 };
  let bestParams = {};

  for (
    let avgVolPeriod = avgVolPeriodSetting.min;
    avgVolPeriod <= avgVolPeriodSetting.max;
    avgVolPeriod = getAddedNumber(avgVolPeriod, avgVolPeriodSetting.step, 0)
  ) {
    for (
      let entryAvgVolFactor = entryAvgVolFactorSetting.min;
      entryAvgVolFactor <= entryAvgVolFactorSetting.max;
      entryAvgVolFactor = getAddedNumber(
        entryAvgVolFactor,
        entryAvgVolFactorSetting.step,
        2
      )
    ) {
      for (
        let exitAvgVolFactor = exitAvgVolFactorSetting.min;
        exitAvgVolFactor <= exitAvgVolFactorSetting.max;
        exitAvgVolFactor = getAddedNumber(
          exitAvgVolFactor,
          exitAvgVolFactorSetting.step,
          2
        )
      ) {
        const backtestResult = getBacktestResult({
          shouldLogResults: false,
          startIndex: avgVolPeriodSetting.max,
          avgVolPeriod: avgVolPeriod,
          entryAvgVolFactor: entryAvgVolFactor,
          exitAvgVolFactor: exitAvgVolFactor,
          leverage: 1
        });
        if (
          backtestResult &&
          backtestResult.highestFund > bestResult.highestFund
        ) {
          bestResult = backtestResult;
          bestParams = { avgVolPeriod, entryAvgVolFactor, exitAvgVolFactor };
        }
        progressBar.increment();
      }
    }
  }

  let leverage = 1;

  for (let i = 1; i < 100; i++) {
    const backtestResult = getBacktestResult({
      shouldLogResults: false,
      startIndex: avgVolPeriodSetting.max,
      avgVolPeriod: bestParams.avgVolPeriod,
      entryAvgVolFactor: bestParams.entryAvgVolFactor,
      exitAvgVolFactor: bestParams.exitAvgVolFactor,
      leverage: i
    });
    if (backtestResult) {
      bestResult = backtestResult;
      leverage = i;
    } else {
      break;
    }
  }

  progressBar.stop();

  return { ...bestResult, ...bestParams, leverage };
};

const bestResult = getBestResult();
const {
  fund,
  highestFund,
  avgVolPeriod,
  entryAvgVolFactor,
  exitAvgVolFactor,
  leverage
} = bestResult;
console.log("================================================================");
getBacktestResult({
  shouldLogResults: true,
  startIndex: avgVolPeriodSetting.max,
  avgVolPeriod,
  entryAvgVolFactor,
  exitAvgVolFactor,
  leverage
});
console.log("================================================================");
console.log("fund", fund);
console.log("highestFund", highestFund);
console.log("avgVolPeriod", avgVolPeriod);
console.log("entryAvgVolFactor", entryAvgVolFactor);
console.log("exitAvgVolFactor", exitAvgVolFactor);
console.log("leverage", leverage);
