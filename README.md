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

---

Running Period: 1474 -> _Running period_

--- Hold Results ---------------------------

PNL Percentage: 58.08% -> _The PNL percentage of just holding at the beginning_

With Leverage PNL Percentage: 731.14% -> _The PNL percentage of just holding with leverage at the beginning_

--- Trade Results --------------------------

PNL Percentage: 1643.10% -> _The PNL percentage of Heikin-Ashi trading_

Daily PNL Percentage: 4.76% -> _The PNL percentage of Heikin-Ashi trading daily_

Highest PNL Percentage: 3648.25% -> _The highest PNL percentage of Heikin-Ashi trading_

Lowest PNL Percentage: -13.45% -> _The lowest PNL percentage of Heikin-Ashi trading_

Max Profit Percentage Per Trade: 112.43% -> _The max profit percentage of Heikin-Ashi per trade_

Max Loss Percentage Per Trade: -38.39% -> _The max loss percentage of Heikin-Ashi per trade_

If `Liquidation` appeared, it means that the leverage was too high and the position was forced to be liquidated.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
