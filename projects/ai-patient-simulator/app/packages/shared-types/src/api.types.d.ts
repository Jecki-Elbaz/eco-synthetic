export interface ApiError {
    statusCode: number;
    message: string;
    code: string;
    requestId?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
//# sourceMappingURL=api.types.d.ts.map