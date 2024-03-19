import { nodeCache } from "./cache.js";
import { binanceFuturesAPI } from "./web-services.js";

const getBinanceFuturesAPI = async (path, params) => {
  const randomString = Math.random().toString(36).substring(2, 7);
  const key = path + "/" + randomString;
  if (nodeCache.has(key)) {
    return nodeCache.get(key);
  }
  const response = await binanceFuturesAPI.get(path, { params });
  nodeCache.set(key, response.data);
  return response.data;
};

export const klineDataAPI = async (params) => {
  const responseData = await getBinanceFuturesAPI("/fapi/v1/klines", params);
  return responseData;
};

export const markPriceKlineDataAPI = async (params) => {
  const responseData = await getBinanceFuturesAPI(
    "/fapi/v1/markPriceKlines",
    params
  );
  return responseData;
};
