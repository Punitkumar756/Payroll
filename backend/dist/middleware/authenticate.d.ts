import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../auth/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=authenticate.d.ts.map