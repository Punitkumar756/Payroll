"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
/**
 * Maps MySQL SIGNAL errors from stored procedures to clean HTTP responses.
 * SQLSTATE codes used by our SPs:
 *   45000 - Generic access denied
 *   45001 - Validation error
 *   45002 - Conflict (already exists, period locked, etc.)
 *   45003 - Role-based access denied
 *   45004 - Not found
 */
function errorHandler(err, req, res, _next) {
    console.error(`[Error] ${req.method} ${req.path}:`, err.message);
    if (err.sqlState || err.code === 'ER_SIGNAL_EXCEPTION') {
        const message = err.sqlMessage || err.message;
        if (err.sqlState === '45001' || message?.startsWith('VALIDATION:')) {
            const detail = message.replace('VALIDATION:', '');
            res.status(400).json({ error: 'VALIDATION_ERROR', detail });
            return;
        }
        if (err.sqlState === '45002' || message?.startsWith('CONFLICT:')) {
            const detail = message.replace('CONFLICT:', '');
            res.status(409).json({ error: 'CONFLICT', detail });
            return;
        }
        if (err.sqlState === '45003' || err.sqlState === '45000' || message?.startsWith('ACCESS_DENIED')) {
            res.status(403).json({ error: 'FORBIDDEN', detail: message });
            return;
        }
        if (err.sqlState === '45004' || message?.startsWith('NOT_FOUND:')) {
            const detail = message.replace('NOT_FOUND:', '');
            res.status(404).json({ error: 'NOT_FOUND', detail });
            return;
        }
        // Duplicate key
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'CONFLICT', detail: 'A record with this value already exists' });
            return;
        }
    }
    // Unhandled / unexpected error — don't leak internals
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', detail: 'An unexpected error occurred' });
}
//# sourceMappingURL=errorHandler.js.map