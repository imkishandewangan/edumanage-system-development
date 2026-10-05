import 'reflect-metadata'
import { Body, Controller, Get, Injectable, Module, Post } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import helmet from 'helmet'
import { Logger, LoggerModule } from 'nestjs-pino'
import { EnquirySchema, LoginSchema } from '@edumanage/shared'
import { env } from './config'
import { GlobalExceptionFilter, ResponseInterceptor } from './http'

@Injectable()
class PrismaService extends PrismaClient {
  async onModuleDestroy() { await this.$disconnect() }
}

@Controller()
class AppController {
  private readonly db = new PrismaService()

  @Get('health')
  async health() {
    await this.db.$queryRaw`SELECT 1`
    return { status: 'ok', db: 'up' }
  }

  @Post('auth/login')
  async login(@Body() body: unknown) {
    const input = LoginSchema.parse(body)
    const user = await this.db.user.findUnique({ where: { email: input.email }, include: { role: true } })
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return { ok: false, message: 'Invalid credentials' }
    return { ok: true, accessToken: jwt.sign({ sub: user.id, role: user.role.uniqueKey }, env.JWT_ACCESS_SECRET), user: { id: user.id, name: user.name, email: user.email, role: user.role.uniqueKey } }
  }

  @Get('dashboard/stats')
  async stats() {
    const [students, enquiries, payments] = await Promise.all([this.db.student.count({ where: { status: 'ACTIVE' } }), this.db.enquiry.count(), this.db.payment.aggregate({ _sum: { amount: true } })])
    return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 }
  }

  @Get('enquiries')
  enquiries() { return this.db.enquiry.findMany({ orderBy: { createdAt: 'desc' } }) }

  @Post('enquiries')
  async create(@Body() body: unknown) {
    const input = EnquirySchema.parse(body)
    const institution = await this.db.institution.findFirstOrThrow()
    return this.db.enquiry.create({ data: { ...input, enquiryNo: `ENQ-${Date.now()}`, institutionId: institution.id } })
  }
}

@Module({ imports: [LoggerModule.forRoot({ pinoHttp: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } })], controllers: [AppController], providers: [PrismaService] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.use(helmet())
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: 'http://localhost:5173', credentials: true })
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  const swaggerConfig = new DocumentBuilder().setTitle('EduManage API').setDescription('EduManage operations API').setVersion('1.0').build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig))
  await app.listen(env.PORT)
}

bootstrap()
