-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COACHING',
    "logoFileId" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "receiptHeader" TEXT,
    "receiptFooter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Branch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uniqueKey" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Role_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "permissionKey"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "branchId" TEXT,
    "roleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" DATETIME,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPermissionOverride" (
    "userId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "effect" TEXT NOT NULL,

    PRIMARY KEY ("userId", "permissionKey"),
    CONSTRAINT "UserPermissionOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "deviceInfo" TEXT,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModuleConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "ModuleConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MasterItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MasterItem_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "resetPolicy" TEXT NOT NULL DEFAULT 'NEVER',
    "periodYear" INTEGER,
    CONSTRAINT "NumberSequence_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AcademicYear_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "enquiryNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    CONSTRAINT "Enquiry_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    CONSTRAINT "Payment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Receipt_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Branch_institutionId_idx" ON "Branch"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_institutionId_code_key" ON "Branch"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_institutionId_name_key" ON "Role"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_institutionId_uniqueKey_key" ON "Role"("institutionId", "uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleConfig_institutionId_moduleKey_key" ON "ModuleConfig"("institutionId", "moduleKey");

-- CreateIndex
CREATE INDEX "MasterItem_institutionId_type_isActive_idx" ON "MasterItem"("institutionId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MasterItem_institutionId_type_code_key" ON "MasterItem"("institutionId", "type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_institutionId_key_key" ON "NumberSequence"("institutionId", "key");

-- CreateIndex
CREATE INDEX "AcademicYear_institutionId_isCurrent_idx" ON "AcademicYear"("institutionId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_institutionId_label_key" ON "AcademicYear"("institutionId", "label");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_institutionId_createdAt_idx" ON "AuditLog"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "File_institutionId_ownerType_ownerId_idx" ON "File"("institutionId", "ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Enquiry_institutionId_status_idx" ON "Enquiry"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_institutionId_enquiryNo_key" ON "Enquiry"("institutionId", "enquiryNo");

-- CreateIndex
CREATE INDEX "Student_firstName_phone_status_idx" ON "Student"("firstName", "phone", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutionId_admissionNo_key" ON "Student"("institutionId", "admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_institutionId_receiptNo_key" ON "Receipt"("institutionId", "receiptNo");
