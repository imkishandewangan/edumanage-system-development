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
const helmet_1 = __importDefault(require("helmet"));
const nestjs_pino_1 = require("nestjs-pino");
const shared_1 = require("@edumanage/shared");
const config_1 = require("./config");
const http_1 = require("./http");
const auth_1 = require("./auth");
const config_routes_1 = require("./config-routes");
let AuthController = class AuthController {
    db = auth_1.prisma;
    async login(body) {
        const input = shared_1.LoginSchema.parse(body);
        const user = await (0, auth_1.authenticatePassword)(this.db, input.email, input.password);
        const accessToken = (0, auth_1.signAccessToken)({ id: user.id, institutionId: user.institutionId, branchId: user.branchId, role: user.role.uniqueKey });
        const refreshToken = (0, auth_1.signRefreshToken)(user.id);
        await this.db.refreshToken.create({ data: { userId: user.id, tokenHash: (0, auth_1.hashRefreshToken)(refreshToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        return { accessToken, refreshToken };
    }
    async refresh(token) {
        if (!token)
            throw new Error('Refresh token required');
        const payload = (0, auth_1.verifyRefreshToken)(token);
        const stored = await this.db.refreshToken.findUnique({ where: { tokenHash: (0, auth_1.hashRefreshToken)(token) } });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date())
            throw new Error('Refresh token revoked or expired');
        const user = await this.db.user.findUniqueOrThrow({ where: { id: String(payload.sub) }, include: { role: true } });
        const nextRefresh = (0, auth_1.signRefreshToken)(user.id);
        await this.db.$transaction([
            this.db.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
            this.db.refreshToken.create({ data: { userId: user.id, tokenHash: (0, auth_1.hashRefreshToken)(nextRefresh), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }),
        ]);
        return { accessToken: (0, auth_1.signAccessToken)({ id: user.id, institutionId: user.institutionId, branchId: user.branchId, role: user.role.uniqueKey }), refreshToken: nextRefresh };
    }
    async logout(token) {
        if (token)
            await this.db.refreshToken.updateMany({ where: { tokenHash: (0, auth_1.hashRefreshToken)(token), revokedAt: null }, data: { revokedAt: new Date() } });
    }
    async me(req) {
        const context = req.user;
        const user = await this.db.user.findUniqueOrThrow({ where: { id: context.userId }, include: { role: { include: { permissions: true } }, branch: true, institution: true } });
        return { user: { id: user.id, name: user.name, email: user.email, status: user.status }, role: user.role.uniqueKey, permissions: context.permissions, enabledModules: context.modules, branch: user.branch };
    }
    checkPermissions() { return { status: 'ok' }; }
    checkFees() { return { status: 'ok' }; }
};
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Post)('auth/refresh'),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('auth/me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('admin/permissions-check'),
    (0, auth_1.RequirePermission)('roles.manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkPermissions", null);
__decorate([
    (0, common_1.Get)('fees/permission-check'),
    (0, auth_1.RequireModule)('fees'),
    (0, auth_1.RequirePermission)('fees.payment.create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkFees", null);
AuthController = __decorate([
    (0, common_1.Controller)()
], AuthController);
let AppController = class AppController {
    db = auth_1.prisma;
    async health() { await this.db.$queryRaw `SELECT 1`; return { status: 'ok', db: 'up' }; }
    async stats(req) {
        const institutionId = req.user.institutionId;
        const [students, enquiries, payments] = await Promise.all([
            this.db.student.count({ where: { status: 'ACTIVE', ...(institutionId ? { institutionId } : {}) } }),
            this.db.enquiry.count({ where: institutionId ? { institutionId } : undefined }),
            this.db.payment.aggregate({ where: institutionId ? { institutionId } : undefined, _sum: { amount: true } }),
        ]);
        return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 };
    }
    async enquiries(req) { return this.db.enquiry.findMany({ where: { institutionId: req.user.institutionId }, orderBy: { id: 'desc' } }); }
    async create(body, req) {
        const input = shared_1.EnquirySchema.parse(body);
        return this.db.enquiry.create({ data: { ...input, enquiryNo: `ENQ-${Date.now()}`, institutionId: req.user.institutionId } });
    }
};
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('enquiries'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "enquiries", null);
__decorate([
    (0, common_1.Post)('enquiries'),
    (0, auth_1.RequirePermission)('enquiry.create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "create", null);
AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [nestjs_pino_1.LoggerModule.forRoot({ pinoHttp: { level: config_1.env.NODE_ENV === 'production' ? 'info' : 'debug' } })],
        controllers: [AuthController, AppController, config_routes_1.ConfigController],
        providers: [auth_1.PrismaService, config_routes_1.NumberingService, core_1.Reflector, auth_1.PermissionsGuard, auth_1.ModuleEnabledGuard, { provide: core_1.APP_GUARD, useClass: auth_1.JwtAuthGuard }, { provide: core_1.APP_GUARD, useClass: auth_1.PermissionsGuard }, { provide: core_1.APP_GUARD, useClass: auth_1.ModuleEnabledGuard }],
    })
], AppModule);
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.use((0, helmet_1.default)());
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true });
    app.useGlobalFilters(new http_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new http_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder().setTitle('EduManage API').setDescription('EduManage operations API').setVersion('1.0').addBearerAuth().build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, swaggerConfig));
    await app.listen(config_1.env.PORT);
}
bootstrap();
