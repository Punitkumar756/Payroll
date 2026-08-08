import { Request, Response, NextFunction } from 'express';
interface MySQLError extends Error {
    sqlState?: string;
    sqlMessage?: string;
    code?: string;
}
/**
 * Maps MySQL SIGNAL errors from stored procedures to clean HTTP responses.
 * SQLSTATE codes used by our SPs:
 *   45000 - Generic access denied
 *   45001 - Validation error
 *   45002 - Conflict (already exists, period locked, etc.)
 *   45003 - Role-based access denied
 *   45004 - Not found
 */
export declare function errorHandler(err: MySQLError, req: Request, res: Response, _next: NextFunction): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map