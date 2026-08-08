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
const c = __importStar(require("../controllers/employeeController"));
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// HR-only: full employee list and CRUD
router.get('/', (0, requireRole_1.requireRole)('HR'), c.listEmployees);
router.post('/', (0, requireRole_1.requireRole)('HR'), c.createEmployee);
router.get('/:id', c.getEmployee); // SP enforces own-record for Employee role
router.put('/:id', (0, requireRole_1.requireRole)('HR'), c.updateEmployee);
router.put('/:id/statutory', (0, requireRole_1.requireRole)('HR'), c.updateStatutory);
router.post('/:id/user', (0, requireRole_1.requireRole)('HR'), c.createUserForEmployee);
router.post('/:id/ctc', (0, requireRole_1.requireRole)('HR'), c.assignCTC);
// Self-service: restricted update
router.patch('/self/profile', c.selfUpdateEmployee);
// Users & Roles (HR only)
router.get('/users/list', (0, requireRole_1.requireRole)('HR'), c.listUsers);
router.patch('/users/:id/activate', (0, requireRole_1.requireRole)('HR'), c.activateUser);
router.patch('/users/:id/deactivate', (0, requireRole_1.requireRole)('HR'), c.deactivateUser);
router.patch('/users/:id/role', (0, requireRole_1.requireRole)('HR'), c.assignRole);
exports.default = router;
//# sourceMappingURL=employees.js.map