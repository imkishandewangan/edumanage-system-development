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
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordProviders = exports.RecordController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("./auth");
let RecordController = class RecordController {
    db;
    constructor(db) {
        this.db = db;
    }
    async enquiries(req) { return this.db.enquiry.findMany({ where: { institutionId: req.user.institutionId }, orderBy: { id: 'desc' } }); }
    async createEnquiry(req, body) {
        if (!body.name?.trim() || !body.phone?.trim())
            throw new Error('Name and phone are required');
        return this.db.enquiry.create({ data: { institutionId: req.user.institutionId, enquiryNo: `ENQ-${Date.now()}`, name: body.name.trim(), phone: body.phone.trim(), status: body.status || 'NEW' } });
    }
    async students(req) { return this.db.student.findMany({ where: { institutionId: req.user.institutionId }, orderBy: { firstName: 'asc' } }); }
    async createStudent(req, body) {
        if (!body.firstName?.trim())
            throw new Error('First name is required');
        const count = await this.db.student.count({ where: { institutionId: req.user.institutionId } });
        return this.db.student.create({ data: { institutionId: req.user.institutionId, admissionNo: `ADM-${String(count + 1).padStart(4, '0')}`, firstName: body.firstName.trim(), lastName: body.lastName?.trim(), phone: body.phone?.trim() } });
    }
    async payments(req) { return this.db.payment.findMany({ where: { institutionId: req.user.institutionId }, orderBy: { paidAt: 'desc' } }); }
    async createPayment(req, body) {
        if (!Number.isInteger(body.amount) || body.amount <= 0 || !body.mode)
            throw new Error('Amount and payment mode are required');
        const payment = await this.db.payment.create({ data: { institutionId: req.user.institutionId, amount: body.amount, mode: body.mode, idempotencyKey: `pay-${Date.now()}-${Math.random()}` } });
        const receipt = await this.db.receipt.create({ data: { institutionId: req.user.institutionId, paymentId: payment.id, receiptNo: `RCPT-${Date.now()}` } });
        return { ...payment, receipt };
    }
    async receipt(req, id) { return this.db.receipt.findFirstOrThrow({ where: { paymentId: id, institutionId: req.user.institutionId }, include: { institution: true } }); }
};
exports.RecordController = RecordController;
__decorate([
    (0, common_1.Get)('enquiries'),
    (0, auth_1.RequireModule)('enquiry'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "enquiries", null);
__decorate([
    (0, common_1.Post)('enquiries'),
    (0, auth_1.RequireModule)('enquiry'),
    (0, auth_1.RequirePermission)('enquiry.create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "createEnquiry", null);
__decorate([
    (0, common_1.Get)('students'),
    (0, auth_1.RequireModule)('students'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "students", null);
__decorate([
    (0, common_1.Post)('students'),
    (0, auth_1.RequireModule)('students'),
    (0, auth_1.RequirePermission)('student.create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, auth_1.RequireModule)('fees'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "payments", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, auth_1.RequireModule)('fees'),
    (0, auth_1.RequirePermission)('fees.payment.create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('payments/:id/receipt'),
    (0, auth_1.RequireModule)('fees'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "receipt", null);
exports.RecordController = RecordController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_1.PrismaService])
], RecordController);
exports.recordProviders = [RecordController];
