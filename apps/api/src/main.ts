import 'reflect-metadata'
import { Body, Controller, Get, Headers, HttpCode, Injectable, Module, Post, Req, UseGuards } from '@nestjs/common'
import { APP_GUARD, NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { Logger, LoggerModule } from 'nestjs-pino'
import { EnquirySchema, LoginSchema } from '@edumanage/shared'
import { env } from './config'
import { GlobalExceptionFilter, ResponseInterceptor } from './http'
import { AuthenticatedRequest, authenticatePassword, createRefreshToken, hashRefreshToken, PrismaService, prisma, Public, RequireModule, RequirePermission, JwtAuthGuard, PermissionsGuard, ModuleEnabledGuard, signAccessToken, signRefreshToken, verifyRefreshToken } from './auth'

@Controller()
class AuthController {
  private readonly db = prisma

  @Public()
  @Post('auth/login')
  async login(@Body() body: unknown) {
    const input = LoginSchema.parse(body)
    const user = await authenticatePassword(this.db, input.email, input.password)
    const accessToken = signAccessToken({ id: user.id, institutionId: user.institutionId, branchId: user.branchId, role: user.role.uniqueKey })
    const refreshToken = signRefreshToken(user.id)
    await this.db.refreshToken.create({ data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
    return { accessToken, refreshToken }
  }

  @Public()
  @Post('auth/refresh')
  async refresh(@Body('refreshToken') token: string) {
    if (!token) throw new Error('Refresh token required')
    const payload = verifyRefreshToken(token)
    const stored = await this.db.refreshToken.findUnique({ where: { tokenHash: hashRefreshToken(token) } })
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) throw new Error('Refresh token revoked or expired')
    const user = await this.db.user.findUniqueOrThrow({ where: { id: String(payload.sub) }, include: { role: true } })
    const nextRefresh = signRefreshToken(user.id)
    await this.db.$transaction([
      this.db.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
      this.db.refreshToken.create({ data: { userId: user.id, tokenHash: hashRefreshToken(nextRefresh), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }),
    ])
    return { accessToken: signAccessToken({ id: user.id, institutionId: user.institutionId, branchId: user.branchId, role: user.role.uniqueKey }), refreshToken: nextRefresh }
  }

  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Body('refreshToken') token: string) {
    if (token) await this.db.refreshToken.updateMany({ where: { tokenHash: hashRefreshToken(token), revokedAt: null }, data: { revokedAt: new Date() } })
  }

  @Get('auth/me')
  async me(@Req() req: AuthenticatedRequest) {
    const context = req.user!
    const user = await this.db.user.findUniqueOrThrow({ where: { id: context.userId }, include: { role: { include: { permissions: true } }, branch: true, institution: true } })
    return { user: { id: user.id, name: user.name, email: user.email, status: user.status }, role: user.role.uniqueKey, permissions: context.permissions, enabledModules: context.modules, branch: user.branch }
  }

  @Get('admin/permissions-check')
  @RequirePermission('roles.manage')
  checkPermissions() { return { status: 'ok' } }

  @Get('fees/permission-check')
  @RequireModule('fees')
  @RequirePermission('fees.payment.create')
  checkFees() { return { status: 'ok' } }
}

@Controller()
class AppController {
  private readonly db = prisma
  @Public()
  @Get('health')
  async health() { await this.db.$queryRaw`SELECT 1`; return { status: 'ok', db: 'up' } }
  @Get('dashboard/stats')
  async stats(@Req() req: AuthenticatedRequest) {
    const institutionId = req.user!.institutionId
    const [students, enquiries, payments] = await Promise.all([
      this.db.student.count({ where: { status: 'ACTIVE', ...(institutionId ? { institutionId } : {}) } }),
      this.db.enquiry.count({ where: institutionId ? { institutionId } : undefined }),
      this.db.payment.aggregate({ where: institutionId ? { institutionId } : undefined, _sum: { amount: true } }),
    ])
    return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 }
  }
  @Get('enquiries')
  async enquiries(@Req() req: AuthenticatedRequest) { return this.db.enquiry.findMany({ where: { institutionId: req.user!.institutionId }, orderBy: { id: 'desc' } }) }
  @Post('enquiries')
  @RequirePermission('enquiry.create')
  async create(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = EnquirySchema.parse(body)
    return this.db.enquiry.create({ data: { ...input, enquiryNo: `ENQ-${Date.now()}`, institutionId: req.user!.institutionId } })
  }
}

@Module({
  imports: [LoggerModule.forRoot({ pinoHttp: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } })],
  controllers: [AuthController, AppController],
  providers: [PrismaService, Reflector, PermissionsGuard, ModuleEnabledGuard, { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: PermissionsGuard }, { provide: APP_GUARD, useClass: ModuleEnabledGuard }],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.use(helmet())
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true })
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  const swaggerConfig = new DocumentBuilder().setTitle('EduManage API').setDescription('EduManage operations API').setVersion('1.0').addBearerAuth().build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig))
  await app.listen(env.PORT)
}
bootstrap()
