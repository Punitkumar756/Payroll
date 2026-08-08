export interface JWTPayload {
    userId: number;
    employeeId: number | null;
    role: string;
}
export declare function signAccessToken(payload: JWTPayload): string;
export declare function signRefreshToken(payload: {
    userId: number;
}): string;
export declare function verifyAccessToken(token: string): JWTPayload;
export declare function verifyRefreshToken(token: string): {
    userId: number;
};
//# sourceMappingURL=jwt.d.ts.map