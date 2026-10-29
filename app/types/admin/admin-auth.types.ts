export type AdminRole =
    | "SUPER_ADMIN"
    | "ADMIN"
    | "SUPPORT";

export interface AuthenticatedAdmin {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    status: "ACTIVE";
    roles: AdminRole[];
    permissions: string[];
}

export interface AdminLoginRequest {
    email: string;
    password: string;
    challengeToken: string;
}

export interface AdminLoginResponse {
    admin: AuthenticatedAdmin;
}

export interface AdminMeResponse {
    admin: AuthenticatedAdmin;
}

export interface AdminCsrfTokenResponse {
    csrfToken: string;
}

export interface AdminLogoutResponse {
    message: string;
}
