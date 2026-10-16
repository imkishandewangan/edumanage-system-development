import { createHash, randomBytes } from 'node:crypto'
import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from './config'

export const PUBLIC_ROUTE = 'public_route'
export const REQUIRED_PERMISSION = 'required_permission'
export const REQUIRED_MODULE = 'required_module'
export const Public = () => SetMetadata(PUBLIC_ROUTE, true)
export const RequirePermission = (permission: string) => SetMetadata(REQUIRED_PERMISSION, permission)
export const RequireModule = (module: string) => SetMetadata(REQUIRED_MODULE, module)

function hasMetadata<T>(key: string, context: ExecutionContext): T | undefined {
  return Reflect.getMetadata(key, context.getHandler()) ?? Reflect.getMetadata(key, context.getClass())
}

export type TenantContext = { userId: string; institutionId: string; branchId: string | null; roleKey: string; permissions: string[]; modules: string[] }
export type AuthenticatedRequest = Request & { user?: TenantContext }

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleDestroy() { await this.$disconnect() }
}

export const prisma = new PrismaService()

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly db = prisma
  async canActivate(context: ExecutionContext) {
    if (hasMetadata<boolean>(PUBLIC_ROUTE, context)) return true
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const header = (request.headers as unknown as { authorization?: string }).authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Access token required')
    let payload: JwtPayload
    try { payload = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET) as JwtPayload } catch { throw new UnauthorizedException('Invalid or expired access token') }
    const user = await this.db.user.findUnique({ where: { id: String(payload.sub) }, include: { role: { include: { permissions: true } }, branch: true } })
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('User account is not active')
    const overrides = await this.db.userPermissionOverride.findMany({ where: { userId: user.id } })
    const permissionSet = new Set(user.role.permissions.map((item) => item.permissionKey))
    for (const override of overrides) override.effect === 'ALLOW' ? permissionSet.add(override.permissionKey) : permissionSet.delete(override.permissionKey)
    const modules = (await this.db.moduleConfig.findMany({ where: { institutionId: user.institutionId, enabled: true } })).map((item) => item.moduleKey)
    request.user = { userId: user.id, institutionId: user.institutionId, branchId: user.branchId, roleKey: user.role.uniqueKey, permissions: [...permissionSet], modules }
    return true
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const required = hasMetadata<string>(REQUIRED_PERMISSION, context)
    if (!required) return true
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user
    if (!user?.permissions.includes(required)) throw new ForbiddenException(`Permission required: ${required}`)
    return true
  }
}

@Injectable()
export class ModuleEnabledGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const required = hasMetadata<string>(REQUIRED_MODULE, context)
    if (!required) return true
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user
    if (!user?.modules.includes(required)) throw new ForbiddenException(`Module disabled: ${required}`)
    return true
  }
}

export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex')
export const createRefreshToken = () => randomBytes(48).toString('base64url')
export const hashPassword = (password: string) => argon2.hash(password)
export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password)
export const signAccessToken = (user: { id: string; institutionId: string; branchId: string | null; role: string }) => jwt.sign({ sub: user.id, institution_id: user.institutionId, branch_id: user.branchId, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
export const signRefreshToken = (userId: string) => jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload

export async function authenticatePassword(db: PrismaService, email: string, password: string) {
  const user = await db.user.findUnique({ where: { email }, include: { role: true } })
  if (!user || user.status === 'LOCKED' || !(await verifyPassword(user.passwordHash, password))) {
    if (user) {
      const failedAttempts = user.failedAttempts + 1
      await db.user.update({ where: { id: user.id }, data: { failedAttempts, status: failedAttempts >= 5 ? 'LOCKED' : user.status } })
    }
    throw new UnauthorizedException('Invalid credentials')
  }
  await db.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lastLoginAt: new Date() } })
  return user
}
