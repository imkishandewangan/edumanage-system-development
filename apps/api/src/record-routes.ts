import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { PrismaService, AuthenticatedRequest, RequireModule, RequirePermission } from './auth'

@Controller()
export class RecordController {
  constructor(private readonly db: PrismaService) {}
  @Get('enquiries')
  @RequireModule('enquiry')
  async enquiries(@Req() req: AuthenticatedRequest) { return this.db.enquiry.findMany({ where: { institutionId: req.user!.institutionId }, orderBy: { id: 'desc' } }) }
  @Post('enquiries')
  @RequireModule('enquiry') @RequirePermission('enquiry.create')
  async createEnquiry(@Req() req: AuthenticatedRequest, @Body() body: { name: string; phone: string; status?: string }) {
    if (!body.name?.trim() || !body.phone?.trim()) throw new Error('Name and phone are required')
    return this.db.enquiry.create({ data: { institutionId: req.user!.institutionId, enquiryNo: `ENQ-${Date.now()}`, name: body.name.trim(), phone: body.phone.trim(), status: body.status || 'NEW' } })
  }
  @Get('students')
  @RequireModule('students')
  async students(@Req() req: AuthenticatedRequest) { return this.db.student.findMany({ where: { institutionId: req.user!.institutionId }, orderBy: { firstName: 'asc' } }) }
  @Post('students')
  @RequireModule('students') @RequirePermission('student.create')
  async createStudent(@Req() req: AuthenticatedRequest, @Body() body: { firstName: string; lastName?: string; phone?: string }) {
    if (!body.firstName?.trim()) throw new Error('First name is required')
    const count = await this.db.student.count({ where: { institutionId: req.user!.institutionId } })
    return this.db.student.create({ data: { institutionId: req.user!.institutionId, admissionNo: `ADM-${String(count + 1).padStart(4, '0')}`, firstName: body.firstName.trim(), lastName: body.lastName?.trim(), phone: body.phone?.trim() } })
  }
  @Get('payments')
  @RequireModule('fees')
  async payments(@Req() req: AuthenticatedRequest) { return this.db.payment.findMany({ where: { institutionId: req.user!.institutionId }, orderBy: { paidAt: 'desc' } }) }
  @Post('payments')
  @RequireModule('fees') @RequirePermission('fees.payment.create')
  async createPayment(@Req() req: AuthenticatedRequest, @Body() body: { amount: number; mode: string }) {
    if (!Number.isInteger(body.amount) || body.amount <= 0 || !body.mode) throw new Error('Amount and payment mode are required')
    const payment = await this.db.payment.create({ data: { institutionId: req.user!.institutionId, amount: body.amount, mode: body.mode, idempotencyKey: `pay-${Date.now()}-${Math.random()}` } })
    const receipt = await this.db.receipt.create({ data: { institutionId: req.user!.institutionId, paymentId: payment.id, receiptNo: `RCPT-${Date.now()}` } })
    return { ...payment, receipt }
  }
  @Get('payments/:id/receipt')
  @RequireModule('fees')
  async receipt(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.db.receipt.findFirstOrThrow({ where: { paymentId: id, institutionId: req.user!.institutionId }, include: { institution: true } }) }
}

export const recordProviders = [RecordController]
export type RecordRoutes = RecordController
