import { AuthService } from "./authService";

export const AuthUsecase = {
  async login(username: string, password: string) {
    return await AuthService.login(username, password);
  }
};
