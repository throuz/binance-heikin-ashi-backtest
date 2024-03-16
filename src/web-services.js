import axios from "axios";
import { API_KEY, REST_BASEURL } from "../configs/env-config.js";

export const binanceFuturesAPI = axios.create({
  baseURL: REST_BASEURL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-MBX-APIKEY": API_KEY
  }
});
