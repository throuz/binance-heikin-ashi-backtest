import { getBacktestResult } from "./src/backtest.js";
import { setHistoryData } from "./history/history.js";

await setHistoryData();

const avgVolPeriodSetting = { min: 2, max: 30, step: 1 };
const entryAvgVolFactorSetting = { min: 0.5, max: 1, step: 0.05 };
const exitAvgVolFactorSetting = { min: 1, max: 1.5, step: 0.05 };

const getBestResult = () => {
  let bestResult = { fund: 0, highestFund: 0 };
  let bestParams = {};

  for (
    let avgVolPeriod = avgVolPeriodSetting.min;
    avgVolPeriod <= avgVolPeriodSetting.max;
    avgVolPeriod += avgVolPeriodSetting.step
  ) {
    for (
      let entryAvgVolFactor = entryAvgVolFactorSetting.min;
      entryAvgVolFactor <= entryAvgVolFactorSetting.max;
      entryAvgVolFactor += entryAvgVolFactorSetting.step
    ) {
      for (
        let exitAvgVolFactor = exitAvgVolFactorSetting.min;
        exitAvgVolFactor <= exitAvgVolFactorSetting.max;
        exitAvgVolFactor += exitAvgVolFactorSetting.step
      ) {
        const backtestResult = getBacktestResult(
          avgVolPeriodSetting.max,
          avgVolPeriod,
          entryAvgVolFactor,
          exitAvgVolFactor
        );
        if (
          backtestResult &&
          backtestResult.fund > bestResult.fund &&
          backtestResult.highestFund > bestResult.highestFund
        ) {
          bestResult = backtestResult;
          bestParams = { avgVolPeriod, entryAvgVolFactor, exitAvgVolFactor };
        }
      }
    }
  }

  let leverage = 1;

  for (let i = 1; i < 100; i++) {
    const backtestResult = getBacktestResult(
      avgVolPeriodSetting.max,
      bestParams.avgVolPeriod,
      bestParams.entryAvgVolFactor,
      bestParams.exitAvgVolFactor,
      i
    );
    if (backtestResult) {
      bestResult = backtestResult;
      leverage = i;
    } else {
      break;
    }
  }

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
console.log("fund", fund);
console.log("highestFund", highestFund);
console.log("avgVolPeriod", avgVolPeriod);
console.log("entryAvgVolFactor", entryAvgVolFactor);
console.log("exitAvgVolFactor", exitAvgVolFactor);
console.log("leverage", leverage);
