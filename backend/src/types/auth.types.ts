/**
 * Request body for POST /api/auth/signup
 */
export interface SignupRequestBody {
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
}

/**
 * User as returned in API responses (no password)
 */
export interface UserResponse {
  id: string;
  email: string;
  dateOfBirth: string;
  createdAt: string;
}

/**
 * Successful signup response
 */
export interface SignupResponse {
  user: UserResponse;
  message: string;
}

/**
 * Request body for POST /api/auth/login
 */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Successful login response
 */
export interface LoginResponse {
  user: UserResponse;
  message: string;
}

/**
 * Request body for POST /api/auth/change-password
 */
export interface ChangePasswordRequestBody {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
