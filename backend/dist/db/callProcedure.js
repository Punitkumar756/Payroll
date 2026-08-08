"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.q = q;
exports.callSP = callSP;
exports.callSPOne = callSPOne;
const pool_1 = __importDefault(require("./pool"));
/**
 * Safely converts Express query param (string | string[] | ParsedQs | undefined) to SPParam
 */
function q(val, fallback = null) {
    if (val === undefined || val === null)
        return fallback;
    if (Array.isArray(val))
        return val[0] ?? fallback;
    if (typeof val === 'object')
        return fallback;
    return val;
}
/**
 * The ONLY function that executes SQL in the entire backend.
 * Invokes a named stored procedure with positional parameters.
 * Never builds dynamic SQL strings.
 */
async function callSP(procedureName, params = []) {
    const placeholders = params.map(() => '?').join(', ');
    const sql = `CALL ${procedureName}(${placeholders})`;
    const [results] = await pool_1.default.execute(sql, params);
    // MySQL returns results as an array of result sets; return the first one
    if (Array.isArray(results) && Array.isArray(results[0])) {
        return results[0];
    }
    return results;
}
/**
 * For procedures that return a single row result set.
 */
async function callSPOne(procedureName, params = []) {
    const rows = await callSP(procedureName, params);
    if (Array.isArray(rows) && rows.length > 0) {
        return rows[0];
    }
    return null;
}
//# sourceMappingURL=callProcedure.js.map