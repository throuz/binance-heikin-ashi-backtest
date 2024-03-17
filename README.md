# Binance Heikin-Ashi Backtest

Binance Heikin-Ashi Backtest is specifically used to backtest the performance of Heikin-Ashi in contract trading.

## DISCLAIMER: Use at your own risk.

## Basic usage

1. Install all dependencies.

```
npm i
```

2. Modify API_KEY and SECRET_KEY to your own in `configs/env-config.js`.

3. Trading parameters can be modified in `configs/trade-config.js`.

4. Run the command to get the result

```
npm run app
```

## Explanation of result

result: 'Is a good strategy' -> *If finalMultiples performs better than onlyHoldMultiples, it is judged to be a good strategy.*

runningDays: 1500 -> *Running days*

onlyHoldMultiples: 33 -> *The final return of just holding at the beginning (unit is a multiple)*

finalMultiples: 5448160 -> *The final return of Heikin-Ashi trading (unit is a multiple)*

If `Liquidation` appears, it means that the leverage was too high and the position was forced to be liquidated.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
