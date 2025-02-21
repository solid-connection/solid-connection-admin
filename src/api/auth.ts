import { AxiosResponse } from "axios";
import { AdminSignInResponse, ReissueAccessTokenResponse } from "@/types/auth";
import { publicAxiosInstance } from "@/utils/axiosInstance";

export const adminSignInApi = (
  email: string,
  password: string,
): Promise<AxiosResponse<AdminSignInResponse>> =>
  publicAxiosInstance.post("/admin/auth/sign-in", { email, password });

export const reissueAccessTokenApi = (
  refreshToken: string,
): Promise<AxiosResponse<ReissueAccessTokenResponse>> =>
  publicAxiosInstance.post(
    "/admin/auth/reissue",
    {},
    {
      headers: { Authorization: `Bearer ${refreshToken}` },
    },
  );
