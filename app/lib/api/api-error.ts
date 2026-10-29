export interface ApiErrorDetails {
    code?: string;
    status?: number;
    requestId?: string;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly requestId?: string;

    constructor(
        message: string,
        details: ApiErrorDetails = {},
    ) {
        super(message);

        this.name = "ApiError";
        this.status = details.status ?? 500;

        if (details.code !== undefined) {
            this.code = details.code;
        }

        if (details.requestId !== undefined) {
            this.requestId = details.requestId;
        }
    }
}