import api from "@/shared/lib/api";
import type { LoginCredentials, LoginResponse } from "../types/auth";

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  persistSession(data: LoginResponse) {
    localStorage.setItem("token", data.access_token);

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data.user;
  },
};
