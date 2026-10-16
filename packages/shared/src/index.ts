import { z } from 'zod'

export const Role = z.enum(['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE'])
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
export type LoginInput = z.infer<typeof LoginSchema>

export const permissionKeys = [
  'config.manage', 'roles.manage', 'users.manage',
  'enquiry.read', 'enquiry.create', 'enquiry.update', 'enquiry.delete',
  'student.read', 'student.create', 'student.update', 'student.deactivate',
  'academics.manage', 'fees.plan.manage', 'fees.assign', 'fees.payment.create',
  'fees.discount.request', 'fees.discount.approve', 'fees.refund', 'fees.receipt.cancel',
  'attendance.mark', 'attendance.edit', 'reports.view', 'reports.export',
  'audit.read', 'system.backup',
] as const
export type PermissionKey = typeof permissionKeys[number]

export const rolePermissionPresets: Record<z.infer<typeof Role>, readonly PermissionKey[]> = {
  SUPER_ADMIN: permissionKeys,
  ADMIN: permissionKeys.filter((key) => !['config.manage', 'roles.manage', 'system.backup'].includes(key)),
  EXECUTIVE: permissionKeys.filter((key) => [
    'enquiry.read', 'enquiry.create', 'enquiry.update', 'student.read', 'student.create',
    'student.update', 'fees.assign', 'fees.payment.create', 'fees.discount.request', 'attendance.mark', 'reports.view',
  ].includes(key)),
}

export const permissions = permissionKeys
export const EnquirySchema = z.object({ name: z.string().trim().min(2), phone: z.string().trim().min(5).max(30), course: z.string().trim().max(120).optional(), source: z.string().trim().max(80).optional() })
export const StudentSchema = z.object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().max(100).optional(), phone: z.string().trim().max(30).optional() })
export const CourseSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).optional() })
export const PaymentSchema = z.object({ studentId: z.string().uuid(), amountMinorUnits: z.number().int().positive().max(2_000_000_000), mode: z.string().trim().min(2).max(40) })
export const AttendanceSchema = z.object({ studentId: z.string().uuid(), date: z.string().date(), status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE']) })
export type DashboardStats = { students: number; enquiries: number; collectedAmount: number }
