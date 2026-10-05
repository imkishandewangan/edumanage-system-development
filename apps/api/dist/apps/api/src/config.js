"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = exports.env = void 0;
exports.validateEnvironment = validateEnvironment;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1).default('file:../data/edumanage.db'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16).default('dev-access-secret-change-me'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16).default('dev-refresh-secret-change-me'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    UPLOAD_DIR: zod_1.z.string().min(1).default('./uploads'),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
});
exports.envSchema = envSchema;
exports.env = envSchema.parse(process.env);
function validateEnvironment() {
    return exports.env;
}
