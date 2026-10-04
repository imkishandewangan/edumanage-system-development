import 'reflect-metadata'
import { Body, Controller, Get, Injectable, Module, Post } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { EnquirySchema, LoginSchema } from '@edumanage/shared'

@Injectable() class Db extends PrismaClient {}
@Controller() class AppController {
  constructor(private db: Db) {}
  @Get('health') health() { return { ok: true, service: 'edumanage-api' } }
  @Post('auth/login') async login(@Body() body: unknown) { const input = LoginSchema.parse(body); const user = await this.db.user.findUnique({ where: { email: input.email }, include: { role: true } }); if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return { ok:false, message:'Invalid credentials' }; return { ok:true, accessToken: jwt.sign({ sub:user.id, role:user.role.uniqueKey }, process.env.JWT_ACCESS_SECRET || 'dev-secret'), user:{ id:user.id, name:user.name, email:user.email, role:user.role.uniqueKey } } }
  @Get('dashboard/stats') async stats() { const [students,enquiries,payments] = await Promise.all([this.db.student.count({where:{status:'ACTIVE'}}),this.db.enquiry.count(),this.db.payment.aggregate({_sum:{amount:true}})]); return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 } }
  @Get('enquiries') enquiries() { return this.db.enquiry.findMany({ orderBy:{createdAt:'desc'} }) }
  @Post('enquiries') async create(@Body() body: unknown) { const input = EnquirySchema.parse(body); return this.db.enquiry.create({ data:{ ...input, enquiryNo:`ENQ-${Date.now()}`, institutionId:(await this.db.institution.findFirstOrThrow()).id } }) }
}
@Module({controllers:[AppController],providers:[Db]}) class AppModule {}
async function bootstrap(){ const app=await NestFactory.create(AppModule); app.enableCors(); await app.listen(process.env.PORT || 4000) }
bootstrap()
