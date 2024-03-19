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

Hold PNL Percentage: 2865.11% -> _The PNL percentage of just holding at the beginning_

Final PNL Percentage: 21226.63% -> _The PNL percentage of Heikin-Ashi trading_

Result: good -> _If final PNL better than hold PNL, it is judged as good, otherwise as bad_

If `Liquidation` appeared, it means that the leverage was too high and the position was forced to be liquidated.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
