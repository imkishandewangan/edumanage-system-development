import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common'
import { PrismaService, AuthenticatedRequest, RequirePermission } from './auth'

@Controller('config')
@RequirePermission('config.manage')
export class ConfigController {
  constructor(private readonly db: PrismaService) {}
  private institution(req: AuthenticatedRequest) { return req.user!.institutionId }

  @Get('institution')
  getInstitution(@Req() req: AuthenticatedRequest) { return this.db.institution.findUniqueOrThrow({ where: { id: this.institution(req) } }) }

  @Put('institution')
  updateInstitution(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    const allowed = ['name', 'type', 'address', 'phone', 'email', 'currency', 'timezone', 'receiptHeader', 'receiptFooter']
    const data = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && typeof value === 'string'))
    return this.db.institution.update({ where: { id: this.institution(req) }, data })
  }

  @Get('modules')
  getModules(@Req() req: AuthenticatedRequest) { return this.db.moduleConfig.findMany({ where: { institutionId: this.institution(req) }, orderBy: { moduleKey: 'asc' } }) }

  @Put('modules')
  async updateModules(@Req() req: AuthenticatedRequest, @Body() body: { moduleKey?: string; enabled?: boolean } | { modules?: Array<{ moduleKey: string; enabled: boolean }> }) {
    const institutionId = this.institution(req)
    const modules = 'modules' in body && Array.isArray(body.modules) ? body.modules : 'moduleKey' in body && body.moduleKey ? [{ moduleKey: body.moduleKey, enabled: Boolean(body.enabled) }] : []
    return this.db.$transaction(modules.map((item) => this.db.moduleConfig.upsert({ where: { institutionId_moduleKey: { institutionId, moduleKey: item.moduleKey } }, update: { enabled: item.enabled }, create: { institutionId, moduleKey: item.moduleKey, enabled: item.enabled } })))
  }

  @Get('masters/:type')
  getMasters(@Req() req: AuthenticatedRequest, @Param('type') type: string) { return this.db.masterItem.findMany({ where: { institutionId: this.institution(req), type: type.toUpperCase() }, orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }] }) }

  @Post('masters/:type')
  createMaster(@Req() req: AuthenticatedRequest, @Param('type') type: string, @Body() body: { label: string; code?: string; sortOrder?: number }) { return this.db.masterItem.create({ data: { institutionId: this.institution(req), type: type.toUpperCase(), label: body.label, code: body.code, sortOrder: body.sortOrder ?? 0 } }) }

  @Put('masters/:type/:id')
  updateMaster(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { label?: string; code?: string; sortOrder?: number; isActive?: boolean }) { return this.db.masterItem.update({ where: { id, institutionId: this.institution(req) }, data: body }) }

  @Delete('masters/:type/:id')
  deleteMaster(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.db.masterItem.delete({ where: { id, institutionId: this.institution(req) } }) }

  @Get('numbering')
  getNumbering(@Req() req: AuthenticatedRequest) { return this.db.numberSequence.findMany({ where: { institutionId: this.institution(req) }, orderBy: { key: 'asc' } }) }

  @Put('numbering/:key')
  updateNumbering(@Req() req: AuthenticatedRequest, @Param('key') key: string, @Body() body: { pattern?: string; resetPolicy?: string }) { return this.db.numberSequence.update({ where: { institutionId_key: { institutionId: this.institution(req), key } }, data: body }) }

  @Get('academic-years')
  getAcademicYears(@Req() req: AuthenticatedRequest) { return this.db.academicYear.findMany({ where: { institutionId: this.institution(req) }, orderBy: { startDate: 'desc' } }) }

  @Post('academic-years')
  createAcademicYear(@Req() req: AuthenticatedRequest, @Body() body: { label: string; startDate: string; endDate: string; isCurrent?: boolean }) { return this.db.academicYear.create({ data: { institutionId: this.institution(req), label: body.label, startDate: new Date(body.startDate), endDate: new Date(body.endDate), isCurrent: Boolean(body.isCurrent) } }) }

  @Put('academic-years/:id')
  updateAcademicYear(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Partial<{ label: string; startDate: string; endDate: string; isCurrent: boolean }>) { const data = { ...body, ...(body.startDate ? { startDate: new Date(body.startDate) } : {}), ...(body.endDate ? { endDate: new Date(body.endDate) } : {}) }; return this.db.academicYear.update({ where: { id, institutionId: this.institution(req) }, data }) }

  @Delete('academic-years/:id')
  deleteAcademicYear(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.db.academicYear.delete({ where: { id, institutionId: this.institution(req) } }) }
}

export class NumberingService {
  constructor(private readonly db: PrismaService) {}
  async next(institutionId: string, key: string) {
    return this.db.$transaction(async (tx) => {
      const sequence = await tx.numberSequence.findUniqueOrThrow({ where: { institutionId_key: { institutionId, key } } })
      const currentValue = sequence.currentValue + 1
      await tx.numberSequence.update({ where: { id: sequence.id }, data: { currentValue } })
      const year = String(new Date().getFullYear()).slice(-2)
      return sequence.pattern.replace('{BRANCH}', 'MAIN').replace('{YY}', year).replace('{SEQ:4}', String(currentValue).padStart(4, '0')).replace('{SEQ}', String(currentValue))
    })
  }
}

export function registerConfigProviders() { return [ConfigController, NumberingService] }
export const configProviders = [NumberingService]
