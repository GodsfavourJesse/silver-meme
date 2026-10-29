export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    accountType: string;
    status: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
}

export interface RegisterResponse {
    user: AuthUser;
    requiresEmailVerification: boolean;
}

export interface LoginResponse {
    user: AuthUser;
}

export interface CurrentUserResponse {
    user: AuthUser;
}

export interface EmailVerificationInput {
    email: string;
    code: string;
}

export interface ResendVerificationInput {
    email: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}