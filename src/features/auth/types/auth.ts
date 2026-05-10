export type LoginUserType = "tenant" | "driver";

export type LoginCredentials = {
  email: string;
  password: string;
  userType: LoginUserType;
};

export type AuthUser = Record<string, any>;

export type LoginResponse = {
  access_token: string;
  user?: AuthUser;
};
