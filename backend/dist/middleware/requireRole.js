"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
/**
 * Factory middleware that enforces role-based access at the API layer.
 * This is the SECOND enforcement point (first is the SP itself).
 *
 * Usage: router.get('/something', requireRole('HR'), controller)
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'UNAUTHORIZED', message: 'Not authenticated' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'FORBIDDEN',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map