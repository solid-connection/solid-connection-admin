import axios, { AxiosInstance } from "axios";
import { reissueAccessTokenApi } from "@/api/auth";
import { isTokenExpired } from "./jwtUtils";
import {
  loadAccessToken,
  loadRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  saveAccessToken,
} from "./localStorage";

const convertToBearer = (token: string) => `Bearer ${token}`;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const newConfig = { ...config };
    let accessToken: string | null = loadAccessToken();

    if (accessToken === null || isTokenExpired(accessToken)) {
      const refreshToken = loadRefreshToken();
      if (refreshToken === null || isTokenExpired(refreshToken)) {
        removeAccessToken();
        removeRefreshToken();
        return config;
      }

      await reissueAccessTokenApi(refreshToken)
        .then((res) => {
          accessToken = res.data.accessToken;
          saveAccessToken(accessToken);
        })
        .catch((err) => {
          removeAccessToken();
          removeRefreshToken();
          console.error("인증 토큰 갱신중 오류가 발생했습니다", err);
        });
    }

    if (accessToken !== null) {
      newConfig.headers.Authorization = convertToBearer(accessToken);
    }
    return newConfig;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const newError = { ...error };
    if (error.response?.status === 401 || error.response?.status === 403) {
      const refreshToken = loadRefreshToken();

      if (refreshToken === null || isTokenExpired(refreshToken)) {
        removeAccessToken();
        removeRefreshToken();
        throw newError;
      }

      try {
        const newAccessToken = await reissueAccessTokenApi(refreshToken).then(
          (res) => res.data.accessToken,
        );
        saveAccessToken(newAccessToken);

        if (error?.config.headers === undefined) {
          newError.config.headers = {};
        }
        newError.config.headers.Authorization = convertToBearer(newAccessToken);

        return await axios.request(newError.config);
      } catch (err) {
        removeAccessToken();
        removeRefreshToken();
        throw Error("로그인이 필요합니다");
      }
    } else {
      throw newError;
    }
  },
);

export const publicAxiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL,
});
