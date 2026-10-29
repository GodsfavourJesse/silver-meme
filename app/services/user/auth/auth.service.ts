import { apiRequest } from "@/app/lib/api/api-client";

import type {
    ApiSuccess,
    ChangePasswordInput,
    CurrentUserResponse,
    ForgotPasswordInput,
    LoginInput,
    LoginResponse,
    RegisterInput,
    RegisterResponse,
    ResendVerificationInput,
    ResetPasswordInput,
    EmailVerificationInput,
} from "../../../types/user/auth.types";

const AUTH_ENDPOINT = "/auth";

export const authService = {
    async register(
        input: RegisterInput,
    ): Promise<ApiSuccess<RegisterResponse>> {
        return apiRequest<ApiSuccess<RegisterResponse>>(
            `${AUTH_ENDPOINT}/register`,
            {
                method: "POST",
                body: {
                    ...input,
                    email: input.email.trim().toLowerCase(),
                },
            },
        );
    },

    async login(
        input: LoginInput,
    ): Promise<ApiSuccess<LoginResponse>> {
        return apiRequest<ApiSuccess<LoginResponse>>(
            `${AUTH_ENDPOINT}/login`,
            {
                method: "POST",
                body: {
                    email: input.email.trim().toLowerCase(),
                    password: input.password,
                },
            },
        );
    },

    async getCurrentUser(): Promise<ApiSuccess<CurrentUserResponse>> {
        return apiRequest<ApiSuccess<CurrentUserResponse>>(
            `${AUTH_ENDPOINT}/me`,
            {
                method: "GET",
            },
        );
    },

    async logout(): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/logout`,
            {
                method: "POST",
            },
        );
    },

    async verifyEmailWithCode(
        input: EmailVerificationInput,
    ): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/verify-email`,
            {
                method: "POST",
                body: {
                    email: input.email.trim().toLowerCase(),
                    code: input.code.trim(),
                },
            },
        );
    },

    async verifyEmailWithToken(
        token: string,
    ): Promise<unknown> {
        const query = new URLSearchParams({
            token,
        });

        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/verify-email?${query.toString()}`,
            {
                method: "GET",
            },
        );
    },

    async resendVerification(
        input: ResendVerificationInput,
    ): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/verify-email/resend`,
            {
                method: "POST",
                body: {
                    email: input.email.trim().toLowerCase(),
                },
            },
        );
    },

    async forgotPassword(
        input: ForgotPasswordInput,
    ): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/forgot-password`,
            {
                method: "POST",
                body: {
                    email: input.email.trim().toLowerCase(),
                },
            },
        );
    },

    async resetPassword(
        input: ResetPasswordInput,
    ): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/reset-password`,
            {
                method: "POST",
                body: input,
            },
        );
    },

    async changePassword(
        input: ChangePasswordInput,
        csrfToken: string,
    ): Promise<unknown> {
        return apiRequest<unknown>(
            `${AUTH_ENDPOINT}/change-password`,
            {
                method: "POST",
                body: input,
                csrfToken,
            },
        );
    },
};