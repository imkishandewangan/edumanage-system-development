"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquirySchema = exports.permissions = exports.rolePermissionPresets = exports.permissionKeys = exports.LoginSchema = exports.Role = void 0;
const zod_1 = require("zod");
exports.Role = zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE']);
exports.LoginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(8) });
exports.permissionKeys = [
    'config.manage', 'roles.manage', 'users.manage',
    'enquiry.read', 'enquiry.create', 'enquiry.update', 'enquiry.delete',
    'student.read', 'student.create', 'student.update', 'student.deactivate',
    'academics.manage', 'fees.plan.manage', 'fees.assign', 'fees.payment.create',
    'fees.discount.request', 'fees.discount.approve', 'fees.refund', 'fees.receipt.cancel',
    'attendance.mark', 'attendance.edit', 'reports.view', 'reports.export',
    'audit.read', 'system.backup',
];
exports.rolePermissionPresets = {
    SUPER_ADMIN: exports.permissionKeys,
    ADMIN: exports.permissionKeys.filter((key) => !['config.manage', 'roles.manage', 'system.backup'].includes(key)),
    EXECUTIVE: exports.permissionKeys.filter((key) => [
        'enquiry.read', 'enquiry.create', 'enquiry.update', 'student.read', 'student.create',
        'student.update', 'fees.assign', 'fees.payment.create', 'fees.discount.request', 'attendance.mark', 'reports.view',
    ].includes(key)),
};
exports.permissions = exports.permissionKeys;
exports.EnquirySchema = zod_1.z.object({ name: zod_1.z.string().min(2), phone: zod_1.z.string().regex(/^\d{10}$/) });
