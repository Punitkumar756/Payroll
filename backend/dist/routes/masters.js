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
const c = __importStar(require("../controllers/mastersController"));
const router = (0, express_1.Router)();
// All master routes require authentication; most require HR role
router.use(authenticate_1.authenticate);
// Locations
router.get('/locations', c.listLocations);
router.post('/locations', (0, requireRole_1.requireRole)('HR'), c.createLocation);
router.put('/locations/:id', (0, requireRole_1.requireRole)('HR'), c.updateLocation);
router.delete('/locations/:id', (0, requireRole_1.requireRole)('HR'), c.deleteLocation);
// Departments
router.get('/departments', c.listDepartments);
router.post('/departments', (0, requireRole_1.requireRole)('HR'), c.createDepartment);
router.put('/departments/:id', (0, requireRole_1.requireRole)('HR'), c.updateDepartment);
router.delete('/departments/:id', (0, requireRole_1.requireRole)('HR'), c.deleteDepartment);
// Designations
router.get('/designations', c.listDesignations);
router.post('/designations', (0, requireRole_1.requireRole)('HR'), c.createDesignation);
router.put('/designations/:id', (0, requireRole_1.requireRole)('HR'), c.updateDesignation);
router.delete('/designations/:id', (0, requireRole_1.requireRole)('HR'), c.deleteDesignation);
// Categories
router.get('/categories', c.listCategories);
router.post('/categories', (0, requireRole_1.requireRole)('HR'), c.createCategory);
router.put('/categories/:id', (0, requireRole_1.requireRole)('HR'), c.updateCategory);
router.delete('/categories/:id', (0, requireRole_1.requireRole)('HR'), c.deleteCategory);
// Groups
router.get('/groups', c.listGroups);
router.post('/groups', (0, requireRole_1.requireRole)('HR'), c.createGroup);
router.put('/groups/:id', (0, requireRole_1.requireRole)('HR'), c.updateGroup);
// Sub-groups
router.get('/sub-groups', c.listSubGroups);
router.post('/sub-groups', (0, requireRole_1.requireRole)('HR'), c.createSubGroup);
router.put('/sub-groups/:id', (0, requireRole_1.requireRole)('HR'), c.updateSubGroup);
// Calendars
router.get('/calendars', c.listCalendars);
router.post('/calendars', (0, requireRole_1.requireRole)('HR'), c.createCalendar);
router.put('/calendars/:id', (0, requireRole_1.requireRole)('HR'), c.updateCalendar);
// Holidays
router.get('/holidays', c.listHolidays);
router.post('/holidays', (0, requireRole_1.requireRole)('HR'), c.createHoliday);
// Announcements
router.get('/announcements', c.listAnnouncements);
router.post('/announcements', (0, requireRole_1.requireRole)('HR'), c.createAnnouncement);
exports.default = router;
//# sourceMappingURL=masters.js.map