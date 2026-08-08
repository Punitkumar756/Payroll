import pool from "./pool.js";

// Allowed param types for stored procedure calls

/**
 * Safely converts Express query param (string | string[] | ParsedQs | undefined) to SPParam
 */
export function q(val, fallback = null) {
  if (val === undefined || val === null) return fallback;
  if (Array.isArray(val)) return val[0] ?? fallback;
  if (typeof val === "object") return fallback;
  return val;
}

/**
 * The ONLY function that executes SQL in the entire backend.
 * Invokes a named stored procedure with positional parameters.
 * Never builds dynamic SQL strings.
 */
export async function callSP(procedureName, params = []) {
  const safeParams = params.map((p) => (p === undefined ? null : p));
  const placeholders = safeParams.map(() => "?").join(", ");
  const sql = `CALL ${procedureName}(${placeholders})`;

  const [results] = await pool.execute(sql, safeParams);

  // MySQL returns results as an array of result sets; return the first one
  if (Array.isArray(results) && Array.isArray(results[0])) {
    return results[0];
  }
  return results;
}

/**
 * For procedures that return a single row result set.
 */
export async function callSPOne(procedureName, params = []) {
  const rows = await callSP(procedureName, params);
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }
  return null;
}
