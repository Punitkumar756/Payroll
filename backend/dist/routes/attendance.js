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
const c = __importStar(require("../controllers/attendanceController"));
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// Shifts (HR only)
router.get('/shifts', c.listShifts);
router.post('/shifts', (0, requireRole_1.requireRole)('HR'), c.createShift);
router.put('/shifts/:id', (0, requireRole_1.requireRole)('HR'), c.updateShift);
router.post('/shifts/assign', (0, requireRole_1.requireRole)('HR'), c.assignShift);
// Timecard (HR only)
router.post('/process-timecard', (0, requireRole_1.requireRole)('HR'), c.processTimecard);
router.post('/manual-update', (0, requireRole_1.requireRole)('HR'), c.manualAttendance);
router.post('/lock', (0, requireRole_1.requireRole)('HR'), c.lockAttendance);
// Correction requests
router.get('/corrections', (0, requireRole_1.requireRole)('HR'), c.listCorrectionRequests);
router.post('/corrections/:id/approve', (0, requireRole_1.requireRole)('HR'), c.approveCorrection);
// Self-service
router.get('/self', c.getAttendanceSelf);
router.post('/self/correction', c.requestCorrection);
exports.default = router;
//# sourceMappingURL=attendance.js.map