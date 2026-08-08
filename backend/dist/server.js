"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = __importDefault(require("./routes/auth"));
const masters_1 = __importDefault(require("./routes/masters"));
const employees_1 = __importDefault(require("./routes/employees"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const leave_1 = __importDefault(require("./routes/leave"));
const payroll_1 = __importDefault(require("./routes/payroll"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000');
// Ensure upload directory exists
const uploadDir = process.env.STORAGE_PATH || './uploads';
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
// ── Middleware ────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static file serving for uploaded documents (PDFs, photos)
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/masters', masters_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/leave', leave_1.default);
app.use('/api/payroll', payroll_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'HRMS API' });
});
// ── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`\n🚀 HRMS Backend running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database:    ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map