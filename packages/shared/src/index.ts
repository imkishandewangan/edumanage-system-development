import { z } from 'zod'

export const Role = z.enum(['SUPER_ADMIN','ADMIN','EXECUTIVE'])
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
export const EnquirySchema = z.object({ name: z.string().min(2), phone: z.string().regex(/^\d{10}$/), courseInterest: z.string().optional(), source: z.string().optional(), remarks: z.string().optional() })
export type LoginInput = z.infer<typeof LoginSchema>
export type EnquiryInput = z.infer<typeof EnquirySchema>
export type DashboardStats = { students: number; enquiries: number; collectedPaise: number; attendanceRate: number }
export const permissions = ['config.manage','roles.manage','users.manage','enquiry.read','enquiry.create','enquiry.update','student.read','student.create','student.update','fees.payment.create','fees.assign','attendance.mark','reports.view'] as const
