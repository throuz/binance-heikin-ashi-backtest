import crypto from "node:crypto";
import querystring from "node:querystring";
import { SECRET_KEY } from "../configs/env-config.js";
import { nodeCache } from "./cache.js";
import { binanceFuturesAPI } from "./web-services.js";

export const getSignature = (totalParams) => {
  const queryString = querystring.stringify(totalParams);
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(queryString)
    .digest("hex");
  return signature;
};

export const getBinanceFuturesAPI = async (path, totalParams) => {
  const signature = getSignature(totalParams);
  const key = path + "/" + signature;
  if (nodeCache.has(key)) {
    return nodeCache.get(key);
  }
  const response = await binanceFuturesAPI.get(path, {
    params: { ...totalParams, signature }
  });
  nodeCache.set(key, response.data);
  return response.data;
};

// GET

export const klineDataAPI = async (totalParams) => {
  const responseData = await getBinanceFuturesAPI(
    "/fapi/v1/klines",
    totalParams
  );
  return responseData;
};

export const markPriceKlineDataAPI = async (totalParams) => {
  const responseData = await getBinanceFuturesAPI(
    "/fapi/v1/markPriceKlines",
    totalParams
  );
  return responseData;
};
