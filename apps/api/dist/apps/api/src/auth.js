"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.signRefreshToken = exports.signAccessToken = exports.verifyPassword = exports.hashPassword = exports.createRefreshToken = exports.hashRefreshToken = exports.ModuleEnabledGuard = exports.PermissionsGuard = exports.JwtAuthGuard = exports.prisma = exports.PrismaService = exports.RequireModule = exports.RequirePermission = exports.Public = exports.REQUIRED_MODULE = exports.REQUIRED_PERMISSION = exports.PUBLIC_ROUTE = void 0;
exports.authenticatePassword = authenticatePassword;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
exports.PUBLIC_ROUTE = 'public_route';
exports.REQUIRED_PERMISSION = 'required_permission';
exports.REQUIRED_MODULE = 'required_module';
const Public = () => (0, common_1.SetMetadata)(exports.PUBLIC_ROUTE, true);
exports.Public = Public;
const RequirePermission = (permission) => (0, common_1.SetMetadata)(exports.REQUIRED_PERMISSION, permission);
exports.RequirePermission = RequirePermission;
const RequireModule = (module) => (0, common_1.SetMetadata)(exports.REQUIRED_MODULE, module);
exports.RequireModule = RequireModule;
function hasMetadata(key, context) {
    return Reflect.getMetadata(key, context.getHandler()) ?? Reflect.getMetadata(key, context.getClass());
}
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleDestroy() { await this.$disconnect(); }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
exports.prisma = new PrismaService();
let JwtAuthGuard = class JwtAuthGuard {
    db = exports.prisma;
    async canActivate(context) {
        if (hasMetadata(exports.PUBLIC_ROUTE, context))
            return true;
        const request = context.switchToHttp().getRequest();
        const header = request.headers.authorization;
        if (!header?.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('Access token required');
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(header.slice(7), config_1.env.JWT_ACCESS_SECRET);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
        const user = await this.db.user.findUnique({ where: { id: String(payload.sub) }, include: { role: { include: { permissions: true } }, branch: true } });
        if (!user || user.status !== 'ACTIVE')
            throw new common_1.UnauthorizedException('User account is not active');
        const overrides = await this.db.userPermissionOverride.findMany({ where: { userId: user.id } });
        const permissionSet = new Set(user.role.permissions.map((item) => item.permissionKey));
        for (const override of overrides)
            override.effect === 'ALLOW' ? permissionSet.add(override.permissionKey) : permissionSet.delete(override.permissionKey);
        const modules = (await this.db.moduleConfig.findMany({ where: { institutionId: user.institutionId, enabled: true } })).map((item) => item.moduleKey);
        request.user = { userId: user.id, institutionId: user.institutionId, branchId: user.branchId, roleKey: user.role.uniqueKey, permissions: [...permissionSet], modules };
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
let PermissionsGuard = class PermissionsGuard {
    canActivate(context) {
        const required = hasMetadata(exports.REQUIRED_PERMISSION, context);
        if (!required)
            return true;
        const user = context.switchToHttp().getRequest().user;
        if (!user?.permissions.includes(required))
            throw new common_1.ForbiddenException(`Permission required: ${required}`);
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)()
], PermissionsGuard);
let ModuleEnabledGuard = class ModuleEnabledGuard {
    canActivate(context) {
        const required = hasMetadata(exports.REQUIRED_MODULE, context);
        if (!required)
            return true;
        const user = context.switchToHttp().getRequest().user;
        if (!user?.modules.includes(required))
            throw new common_1.ForbiddenException(`Module disabled: ${required}`);
        return true;
    }
};
exports.ModuleEnabledGuard = ModuleEnabledGuard;
exports.ModuleEnabledGuard = ModuleEnabledGuard = __decorate([
    (0, common_1.Injectable)()
], ModuleEnabledGuard);
const hashRefreshToken = (token) => (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
exports.hashRefreshToken = hashRefreshToken;
const createRefreshToken = () => (0, node_crypto_1.randomBytes)(48).toString('base64url');
exports.createRefreshToken = createRefreshToken;
const hashPassword = (password) => argon2_1.default.hash(password);
exports.hashPassword = hashPassword;
const verifyPassword = (hash, password) => argon2_1.default.verify(hash, password);
exports.verifyPassword = verifyPassword;
const signAccessToken = (user) => jsonwebtoken_1.default.sign({ sub: user.id, institution_id: user.institutionId, branch_id: user.branchId, role: user.role }, config_1.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId, type: 'refresh' }, config_1.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
exports.signRefreshToken = signRefreshToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, config_1.env.JWT_REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
async function authenticatePassword(db, email, password) {
    const user = await db.user.findUnique({ where: { email }, include: { role: true } });
    if (!user || user.status === 'LOCKED' || !(await (0, exports.verifyPassword)(user.passwordHash, password))) {
        if (user) {
            const failedAttempts = user.failedAttempts + 1;
            await db.user.update({ where: { id: user.id }, data: { failedAttempts, status: failedAttempts >= 5 ? 'LOCKED' : user.status } });
        }
        throw new common_1.UnauthorizedException('Invalid credentials');
    }
    await db.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lastLoginAt: new Date() } });
    return user;
}
