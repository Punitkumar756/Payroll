import { Request, Response, NextFunction } from 'express';
/**
 * Factory middleware that enforces role-based access at the API layer.
 * This is the SECOND enforcement point (first is the SP itself).
 *
 * Usage: router.get('/something', requireRole('HR'), controller)
 */
export declare function requireRole(...allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map