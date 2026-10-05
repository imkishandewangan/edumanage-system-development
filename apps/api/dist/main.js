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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_1 = require("@edumanage/shared");
let Db = class Db extends client_1.PrismaClient {
};
Db = __decorate([
    (0, common_1.Injectable)()
], Db);
let AppController = class AppController {
    db;
    constructor(db) {
        this.db = db;
    }
    health() { return { ok: true, service: 'edumanage-api' }; }
    async login(body) { const input = shared_1.LoginSchema.parse(body); const user = await this.db.user.findUnique({ where: { email: input.email }, include: { role: true } }); if (!user || !(await bcryptjs_1.default.compare(input.password, user.passwordHash)))
        return { ok: false, message: 'Invalid credentials' }; return { ok: true, accessToken: jsonwebtoken_1.default.sign({ sub: user.id, role: user.role.uniqueKey }, process.env.JWT_ACCESS_SECRET || 'dev-secret'), user: { id: user.id, name: user.name, email: user.email, role: user.role.uniqueKey } }; }
    async stats() { const [students, enquiries, payments] = await Promise.all([this.db.student.count({ where: { status: 'ACTIVE' } }), this.db.enquiry.count(), this.db.payment.aggregate({ _sum: { amount: true } })]); return { students, enquiries, collectedPaise: payments._sum.amount || 0, attendanceRate: 92 }; }
    enquiries() { return this.db.enquiry.findMany({ orderBy: { createdAt: 'desc' } }); }
    async create(body) { const input = shared_1.EnquirySchema.parse(body); return this.db.enquiry.create({ data: { ...input, enquiryNo: `ENQ-${Date.now()}`, institutionId: (await this.db.institution.findFirstOrThrow()).id } }); }
};
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
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
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [Db])
], AppController);
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({ controllers: [AppController], providers: [Db] })
], AppModule);
async function bootstrap() { const app = await core_1.NestFactory.create(AppModule); app.enableCors(); await app.listen(process.env.PORT || 4000); }
bootstrap();
