"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = exports.EnquirySchema = exports.LoginSchema = exports.Role = void 0;
const zod_1 = require("zod");
exports.Role = zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE']);
exports.LoginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(8) });
exports.EnquirySchema = zod_1.z.object({ name: zod_1.z.string().min(2), phone: zod_1.z.string().regex(/^\d{10}$/), courseInterest: zod_1.z.string().optional(), source: zod_1.z.string().optional(), remarks: zod_1.z.string().optional() });
exports.permissions = ['config.manage', 'roles.manage', 'users.manage', 'enquiry.read', 'enquiry.create', 'enquiry.update', 'student.read', 'student.create', 'student.update', 'fees.payment.create', 'fees.assign', 'attendance.mark', 'reports.view'];
