import { authService } from "../services/authService";
import type { LoginUserType } from "../types/auth";

export function useAuth() {
  const loginAs = (email: string, password: string, userType: LoginUserType) =>
    authService.login({ email, password, userType });

  return {
    loginAs,
    persistSession: authService.persistSession,
  };
}
