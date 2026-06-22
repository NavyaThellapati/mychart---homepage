export interface AuthUser {
  id: string;
  uid?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface PasswordResetResponse {
  success: boolean;
  emailSent?: boolean;
  message: string;
  resetToken?: string;
  resetUrl?: string;
}

declare const authService: {
  register(userData: RegisterUserData): Promise<AuthResponse>;
  login(username: string, password: string): Promise<AuthResponse>;
  requestPasswordReset(email: string): Promise<PasswordResetResponse>;
  resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<PasswordResetResponse>;
  logout(): void;
  getCurrentUser(): AuthUser | null;
  getToken(): string | null;
  isAuthenticated(): boolean;
};

export default authService;
