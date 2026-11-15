/**
 * Multi-Tenancy Request Context & Tenant Identity Resolution
 *
 * SECURITY ENFORCEMENT:
 * 1. Tenant identity is derived EXCLUSIVELY from the cryptographically verified Clerk JWT (`req.auth`).
 * 2. Header (`x-tenant-id`, `x-organization-id`) and Query (`tenantId`) overrides are STRICTLY REJECTED.
 * 3. Silent fallback to 'org_legacy_default' is REMOVED.
 * 4. 'org_legacy_default' is quarantined as a read-only system template blueprint.
 */

export const SYSTEM_TEMPLATE_TENANT_ID = "org_legacy_default";
export const DEFAULT_TENANT_ID = SYSTEM_TEMPLATE_TENANT_ID;

/**
 * Resolves the authenticated tenant ID exclusively from verified request auth context.
 *
 * @param {import('fastify').FastifyRequest} req
 * @returns {string} The verified tenant ID
 */
export function resolveTenantId(req) {
  if (!req.auth || !req.auth.userId) {
    throw new Error("Security Violation: Attempted to resolve tenant without verified Clerk authentication.");
  }

  // 1. If user is acting within a Clerk Organization, tenant is the org_id
  if (req.auth.orgId && typeof req.auth.orgId === "string" && req.auth.orgId.trim()) {
    const orgId = req.auth.orgId.trim();
    assertNotTemplate(orgId);
    return orgId;
  }

  // 2. Otherwise, assign dedicated, strictly isolated single-tenant workspace for user
  const userTenant = `tenant_${req.auth.userId.trim()}`;
  assertNotTemplate(userTenant);
  return userTenant;
}

/**
 * Ensures a tenant ID is valid and non-empty.
 *
 * @param {string} tenantId
 * @returns {string}
 */
export function assertTenantId(tenantId) {
  if (!tenantId || typeof tenantId !== "string" || !tenantId.trim()) {
    throw new Error("Mandatory tenantId is missing or invalid. Every query against tenant-owned data must be scoped to a valid tenantId.");
  }
  return tenantId.trim();
}

/**
 * Prevents standard user routes from accessing or mutating the system template.
 *
 * @param {string} tenantId
 */
export function assertNotTemplate(tenantId) {
  if (tenantId === SYSTEM_TEMPLATE_TENANT_ID) {
    throw new Error("Access Denied: org_legacy_default is a system blueprint and cannot be modified or directly accessed by standard users.");
  }
}
