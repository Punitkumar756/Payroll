import { Request, Response, NextFunction } from 'express';
export declare const listEmployees: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEmployee: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEmployee: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEmployee: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const selfUpdateEmployee: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStatutory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createUserForEmployee: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignCTC: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const activateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deactivateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=employeeController.d.ts.map