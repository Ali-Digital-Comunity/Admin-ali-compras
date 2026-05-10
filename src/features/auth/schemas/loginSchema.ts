export const loginSchema = {
  validate(email: string, password: string) {
    return Boolean(email && password);
  },
};
