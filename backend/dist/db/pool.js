"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'hrms',
    user: process.env.DB_USER || 'hrms_app',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    timezone: '+00:00',
});
exports.default = pool;
//# sourceMappingURL=pool.js.map