export interface AdminBoostPlan {
    id: string;
    durationDays: number;
    price: string;
    currency: string;
    active: number;
    createdAt: string;
    totalBoosts: number;
}

export interface CreateAdminBoostPlanInput {
    durationDays: number;
    price: number;
    currency: string;
    active: number;
}

export interface UpdateAdminBoostPlanInput {
    durationDays?: number;
    price?: number;
    currency?: string;
    active?: number;
}

export interface AdminBoostPlanResponse {
    success: boolean;
    message: string;
    data: AdminBoostPlan;
}

export interface AdminBoostPlansResponse {
    success: boolean;
    message: string;
    data: AdminBoostPlan[];
}