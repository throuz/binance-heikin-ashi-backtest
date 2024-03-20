# Binance Heikin-Ashi Backtest

Binance Heikin-Ashi Backtest is specifically used to backtest the performance of Heikin-Ashi in contract trading.

## DISCLAIMER: Use at your own risk.

## Basic usage

1. Install all dependencies.

```
npm i
```

3. Parameters can be modified in `config/config.js`.

4. Run the command to get the result

```
npm run app
```

## Explanation of result

Running Period: 1500 -> _Running period_

Hold PNL Percentage: 49.63% -> _The PNL percentage of just holding at the beginning_

Hold With Leverage PNL Percentage: 191.04% -> _The PNL percentage of just holding with leverage at the beginning_

Trade PNL Percentage: 67.21% -> _The PNL percentage of Heikin-Ashi trading_

If `Liquidation` appeared, it means that the leverage was too high and the position was forced to be liquidated.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
