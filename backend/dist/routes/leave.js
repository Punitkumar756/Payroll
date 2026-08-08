"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const requireRole_1 = require("../middleware/requireRole");
const c = __importStar(require("../controllers/leaveController"));
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// Leave Types (HR only)
router.get('/types', c.listLeaveTypes);
router.post('/types', (0, requireRole_1.requireRole)('HR'), c.createLeaveType);
router.put('/types/:id', (0, requireRole_1.requireRole)('HR'), c.updateLeaveType);
// Leave Policies (HR only)
router.get('/policies', c.listLeavePolicies);
router.post('/policies', (0, requireRole_1.requireRole)('HR'), c.createLeavePolicy);
router.post('/policies/assign', (0, requireRole_1.requireRole)('HR'), c.assignLeavePolicy);
// Accrual
router.post('/accrual', (0, requireRole_1.requireRole)('HR'), c.runAccrual);
// Applications — HR views all
router.get('/applications', (0, requireRole_1.requireRole)('HR'), c.listLeaveApplicationsHR);
router.post('/apply-behalf', (0, requireRole_1.requireRole)('HR'), c.applyLeave); // HR on behalf
router.post('/:id/approve', (0, requireRole_1.requireRole)('HR'), c.approveLeave);
router.post('/:id/reject', (0, requireRole_1.requireRole)('HR'), c.rejectLeave);
// Self-service (all authenticated users)
router.get('/self/balance', c.getLeaveBalanceSelf);
router.get('/self/applications', c.getLeaveApplicationsSelf);
router.post('/self/apply', c.applyLeave);
router.delete('/self/:id/cancel', c.cancelLeave);
exports.default = router;
//# sourceMappingURL=leave.js.map