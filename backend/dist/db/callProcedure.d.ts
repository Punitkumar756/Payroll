import { RowDataPacket } from 'mysql2/promise';
export type SPParam = string | number | boolean | null | Date;
/**
 * Safely converts Express query param (string | string[] | ParsedQs | undefined) to SPParam
 */
export declare function q(val: any, fallback?: SPParam): SPParam;
/**
 * The ONLY function that executes SQL in the entire backend.
 * Invokes a named stored procedure with positional parameters.
 * Never builds dynamic SQL strings.
 */
export declare function callSP<T = RowDataPacket[]>(procedureName: string, params?: SPParam[]): Promise<T>;
/**
 * For procedures that return a single row result set.
 */
export declare function callSPOne<T = RowDataPacket>(procedureName: string, params?: SPParam[]): Promise<T | null>;
//# sourceMappingURL=callProcedure.d.ts.map