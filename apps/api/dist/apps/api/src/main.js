"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helmet_1 = __importDefault(require("helmet"));
const nestjs_pino_1 = require("nestjs-pino");
const shared_1 = require("@edumanage/shared");
const config_1 = require("./config");
const http_1 = require("./http");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleDestroy() { await this.$disconnect(); }
};
PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
let AppController = class AppController {
    db = new PrismaService();
    async health() {
        await this.db.$queryRaw `SELECT 1`;
        return { status: 'ok', db: 'up' };
    }
    async login(body) {
        const input = shared_1.LoginSchema.parse(body);
        const user = await this.db.user.findUnique({ where: { email: input.email }, include: { role: true } });
        if (!user || !(await bcryptjs_1.default.compare(input.password, user.passwordHash)))
            return { ok: false, message: 'Invalid credentials' };
        return { ok: true, accessToken: jsonwebtoken_1.default.sign({ sub: user.id, role: user.role.uniqueKey }, config_1.env.JWT_ACCESS_SECRET), user: { id: user.id, name: user.name, email: user.email, role: user.role.uniqueKey } };
    }
    async stats() {
        const [students, enquiries, payments] = await Promise.all([this.db.student.count({ where: { status: 'ACTIVE' } }), this.db.enquiry.count(), this.db.payment.aggregate({ _sum: { amount: true } })]);
        return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 };
    }
    enquiries() { return this.db.enquiry.findMany({ orderBy: { createdAt: 'desc' } }); }
    async create(body) {
        const input = shared_1.EnquirySchema.parse(body);
        const institution = await this.db.institution.findFirstOrThrow();
        return this.db.enquiry.create({ data: { ...input, enquiryNo: `ENQ-${Date.now()}`, institutionId: institution.id } });
    }
};
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('enquiries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "enquiries", null);
__decorate([
    (0, common_1.Post)('enquiries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "create", null);
AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({ imports: [nestjs_pino_1.LoggerModule.forRoot({ pinoHttp: { level: config_1.env.NODE_ENV === 'production' ? 'info' : 'debug' } })], controllers: [AppController], providers: [PrismaService] })
], AppModule);
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.use((0, helmet_1.default)());
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: 'http://localhost:5173', credentials: true });
    app.useGlobalFilters(new http_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new http_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder().setTitle('EduManage API').setDescription('EduManage operations API').setVersion('1.0').build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, swaggerConfig));
    await app.listen(config_1.env.PORT);
}
bootstrap();
