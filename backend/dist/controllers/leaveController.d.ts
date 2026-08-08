import { Request, Response, NextFunction } from 'express';
export declare const listLeaveTypes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createLeaveType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateLeaveType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listLeavePolicies: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createLeavePolicy: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignLeavePolicy: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const runAccrual: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const applyLeave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveLeave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rejectLeave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listLeaveApplicationsHR: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLeaveBalanceSelf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLeaveApplicationsSelf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelLeave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=leaveController.d.ts.map