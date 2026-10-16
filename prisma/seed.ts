import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const db = new PrismaClient()
const permissions = {
  SUPER_ADMIN: ['config.manage','roles.manage','users.manage','enquiry.read','enquiry.create','enquiry.update','enquiry.delete','student.read','student.create','student.update','student.deactivate','academics.manage','fees.plan.manage','fees.assign','fees.payment.create','fees.discount.request','fees.discount.approve','fees.refund','fees.receipt.cancel','attendance.mark','attendance.edit','reports.view','reports.export','audit.read','system.backup'],
  ADMIN: ['users.manage','enquiry.read','enquiry.create','enquiry.update','enquiry.delete','student.read','student.create','student.update','student.deactivate','academics.manage','fees.plan.manage','fees.assign','fees.payment.create','fees.discount.request','fees.discount.approve','fees.refund','fees.receipt.cancel','attendance.mark','attendance.edit','reports.view','reports.export','audit.read'],
  EXECUTIVE: ['enquiry.read','enquiry.create','enquiry.update','student.read','student.create','student.update','fees.assign','fees.payment.create','fees.discount.request','attendance.mark','reports.view'],
} as const

async function main() {
  const institution = await db.institution.upsert({ where: { id: 'demo-institute' }, update: {}, create: { id: 'demo-institute', name: 'Demo Institute', type: 'COACHING' } })
  const branch = await db.branch.upsert({ where: { institutionId_code: { institutionId: institution.id, code: 'MAIN' } }, update: {}, create: { institutionId: institution.id, name: 'Main Branch', code: 'MAIN' } })
  const roles = {} as Record<keyof typeof permissions, { id: string }>
  for (const key of Object.keys(permissions) as (keyof typeof permissions)[]) {
    const role = await db.role.upsert({ where: { institutionId_uniqueKey: { institutionId: institution.id, uniqueKey: key } }, update: {}, create: { institutionId: institution.id, name: key.replace('_', ' '), uniqueKey: key, isSystem: true } })
    roles[key] = role
    for (const permissionKey of permissions[key]) await db.rolePermission.upsert({ where: { roleId_permissionKey: { roleId: role.id, permissionKey } }, update: {}, create: { roleId: role.id, permissionKey } })
  }
  const passwordHash = await argon2.hash('Demo@12345')
  for (const [key, name, email] of [['SUPER_ADMIN', 'Super Admin', 'super@demo.local'], ['ADMIN', 'Admin', 'admin@demo.local'], ['EXECUTIVE', 'Executive', 'exec@demo.local'] ] as const) {
    await db.user.upsert({ where: { email }, update: { passwordHash, mustChangePassword: false }, create: { institutionId: institution.id, branchId: branch.id, roleId: roles[key].id, name, email, passwordHash, mustChangePassword: false } })
  }
  for (const moduleKey of ['enquiry', 'students', 'academics', 'fees', 'attendance', 'reports']) await db.moduleConfig.upsert({ where: { institutionId_moduleKey: { institutionId: institution.id, moduleKey } }, update: { enabled: true }, create: { institutionId: institution.id, moduleKey, enabled: true } })
  for (const [key, pattern] of [['ADMISSION', '{BRANCH}/{YY}/{SEQ:4}'], ['ENQUIRY', 'ENQ/{YY}/{SEQ:4}'], ['RECEIPT', 'RCT/{YY}/{SEQ:4}']] as const) await db.numberSequence.upsert({ where: { institutionId_key: { institutionId: institution.id, key } }, update: { pattern }, create: { institutionId: institution.id, key, pattern } })
  for (const [type, labels] of Object.entries({ SCHOOL: ['Demo School'], BOARD: ['CBSE'], CATEGORY: ['General'], RELATION: ['Parent'], ENQUIRY_SOURCE: ['Walk-in', 'Referral'], PAYMENT_MODE: ['Cash', 'UPI'] })) for (const label of labels) await db.masterItem.upsert({ where: { institutionId_type_code: { institutionId: institution.id, type, code: label.toUpperCase().replace(/[^A-Z]+/g, '_') } }, update: {}, create: { institutionId: institution.id, type, code: label.toUpperCase().replace(/[^A-Z]+/g, '_'), label } })
  await db.academicYear.upsert({ where: { institutionId_label: { institutionId: institution.id, label: '2026-27' } }, update: { isCurrent: true }, create: { institutionId: institution.id, label: '2026-27', startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31'), isCurrent: true } })
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => db.$disconnect())
