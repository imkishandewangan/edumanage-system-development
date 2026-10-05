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
export const EnquirySchema = z.object({ name: z.string().min(2), phone: z.string().regex(/^\d{10}$/) })
export type DashboardStats = { students: number; enquiries: number; collectedPaise: number; attendanceRate: number }
