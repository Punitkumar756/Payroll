import { Request, Response, NextFunction } from 'express';
export declare const listShifts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createShift: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateShift: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignShift: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const processTimecard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const manualAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const lockAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listCorrectionRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveCorrection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttendanceSelf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requestCorrection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=attendanceController.d.ts.map