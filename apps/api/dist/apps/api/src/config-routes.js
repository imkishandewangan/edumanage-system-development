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
exports.configProviders = exports.NumberingService = exports.ConfigController = void 0;
exports.registerConfigProviders = registerConfigProviders;
const common_1 = require("@nestjs/common");
const auth_1 = require("./auth");
let ConfigController = class ConfigController {
    db;
    constructor(db) {
        this.db = db;
    }
    institution(req) { return req.user.institutionId; }
    getInstitution(req) { return this.db.institution.findUniqueOrThrow({ where: { id: this.institution(req) } }); }
    updateInstitution(req, body) {
        const allowed = ['name', 'type', 'address', 'phone', 'email', 'currency', 'timezone', 'receiptHeader', 'receiptFooter'];
        const data = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && typeof value === 'string'));
        return this.db.institution.update({ where: { id: this.institution(req) }, data });
    }
    getModules(req) { return this.db.moduleConfig.findMany({ where: { institutionId: this.institution(req) }, orderBy: { moduleKey: 'asc' } }); }
    async updateModules(req, body) {
        const institutionId = this.institution(req);
        const modules = 'modules' in body && Array.isArray(body.modules) ? body.modules : 'moduleKey' in body && body.moduleKey ? [{ moduleKey: body.moduleKey, enabled: Boolean(body.enabled) }] : [];
        return this.db.$transaction(modules.map((item) => this.db.moduleConfig.upsert({ where: { institutionId_moduleKey: { institutionId, moduleKey: item.moduleKey } }, update: { enabled: item.enabled }, create: { institutionId, moduleKey: item.moduleKey, enabled: item.enabled } })));
    }
    getMasters(req, type) { return this.db.masterItem.findMany({ where: { institutionId: this.institution(req), type: type.toUpperCase() }, orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }] }); }
    createMaster(req, type, body) { return this.db.masterItem.create({ data: { institutionId: this.institution(req), type: type.toUpperCase(), label: body.label, code: body.code, sortOrder: body.sortOrder ?? 0 } }); }
    updateMaster(req, id, body) { return this.db.masterItem.update({ where: { id, institutionId: this.institution(req) }, data: body }); }
    deleteMaster(req, id) { return this.db.masterItem.delete({ where: { id, institutionId: this.institution(req) } }); }
    getNumbering(req) { return this.db.numberSequence.findMany({ where: { institutionId: this.institution(req) }, orderBy: { key: 'asc' } }); }
    updateNumbering(req, key, body) { return this.db.numberSequence.update({ where: { institutionId_key: { institutionId: this.institution(req), key } }, data: body }); }
    getAcademicYears(req) { return this.db.academicYear.findMany({ where: { institutionId: this.institution(req) }, orderBy: { startDate: 'desc' } }); }
    createAcademicYear(req, body) { return this.db.academicYear.create({ data: { institutionId: this.institution(req), label: body.label, startDate: new Date(body.startDate), endDate: new Date(body.endDate), isCurrent: Boolean(body.isCurrent) } }); }
    updateAcademicYear(req, id, body) { const data = { ...body, ...(body.startDate ? { startDate: new Date(body.startDate) } : {}), ...(body.endDate ? { endDate: new Date(body.endDate) } : {}) }; return this.db.academicYear.update({ where: { id, institutionId: this.institution(req) }, data }); }
    deleteAcademicYear(req, id) { return this.db.academicYear.delete({ where: { id, institutionId: this.institution(req) } }); }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)('institution'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getInstitution", null);
__decorate([
    (0, common_1.Put)('institution'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateInstitution", null);
__decorate([
    (0, common_1.Get)('modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getModules", null);
__decorate([
    (0, common_1.Put)('modules'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateModules", null);
__decorate([
    (0, common_1.Get)('masters/:type'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getMasters", null);
__decorate([
    (0, common_1.Post)('masters/:type'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "createMaster", null);
__decorate([
    (0, common_1.Put)('masters/:type/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateMaster", null);
__decorate([
    (0, common_1.Delete)('masters/:type/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "deleteMaster", null);
__decorate([
    (0, common_1.Get)('numbering'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getNumbering", null);
__decorate([
    (0, common_1.Put)('numbering/:key'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateNumbering", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Post)('academic-years'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "createAcademicYear", null);
__decorate([
    (0, common_1.Put)('academic-years/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateAcademicYear", null);
__decorate([
    (0, common_1.Delete)('academic-years/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "deleteAcademicYear", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    (0, auth_1.RequirePermission)('config.manage'),
    __metadata("design:paramtypes", [auth_1.PrismaService])
], ConfigController);
class NumberingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async next(institutionId, key) {
        return this.db.$transaction(async (tx) => {
            const sequence = await tx.numberSequence.findUniqueOrThrow({ where: { institutionId_key: { institutionId, key } } });
            const currentValue = sequence.currentValue + 1;
            await tx.numberSequence.update({ where: { id: sequence.id }, data: { currentValue } });
            const year = String(new Date().getFullYear()).slice(-2);
            return sequence.pattern.replace('{BRANCH}', 'MAIN').replace('{YY}', year).replace('{SEQ:4}', String(currentValue).padStart(4, '0')).replace('{SEQ}', String(currentValue));
        });
    }
}
exports.NumberingService = NumberingService;
function registerConfigProviders() { return [ConfigController, NumberingService]; }
exports.configProviders = [NumberingService];
