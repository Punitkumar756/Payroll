"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../auth/jwt");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalid or expired' });
    }
}
//# sourceMappingURL=authenticate.js.map