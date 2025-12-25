import { createClient } from '@/services/supabase/server';

/**
 * Type guard to validate role structure from Supabase query
 */
function hasValidRole(roles: unknown): roles is { role_name: string } {
    return (
        roles !== null &&
        typeof roles === 'object' &&
        'role_name' in roles &&
        typeof (roles as { role_name: unknown }).role_name === 'string'
    );
}

/**
 * Get user's role name with type safety
 * Queries the user_roles junction table to get the user's role
 * @param userId - The user's ID (from Supabase auth)
 * @returns The role name in lowercase, or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
    const supabase = await createClient();

    // Query user_roles junction table with join to roles table
    // Schema: users -> user_roles (junction) -> roles
    const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('roles(role_name)')
        .eq('user_id', userId)
        .single();

    if (error || !userRoles) {
        console.error('Error fetching user role:', error);
        return null;
    }

    const roles = userRoles.roles;

    if (!hasValidRole(roles)) {
        console.error('Invalid role structure:', roles);
        return null;
    }

    return roles.role_name.toLowerCase();
}

/**
 * Check if user has one of the specified roles
 * @param userId - The user's ID (from Supabase auth)
 * @param allowedRoles - Array of allowed role names (case-insensitive)
 * @returns true if user has one of the allowed roles
 */
export async function userHasRole(
    userId: string,
    allowedRoles: string[]
): Promise<boolean> {
    const roleName = await getUserRole(userId);

    if (!roleName) {
        return false;
    }

    return allowedRoles.map(r => r.toLowerCase()).includes(roleName);
}

/**
 * Check if user is an admin or manager
 * @param userId - The user's ID (from Supabase auth)
 * @returns true if user is admin or manager
 */
export async function isAdminOrManager(userId: string): Promise<boolean> {
    return userHasRole(userId, ['admin', 'manager']);
}

/**
 * Middleware to verify user has required role
 * Returns error response if unauthorized, null if authorized
 * @param userId - The user's ID (from Supabase auth)
 * @param allowedRoles - Array of allowed role names
 * @returns Error object if unauthorized, null if authorized
 */
export async function requireRole(
    userId: string,
    allowedRoles: string[]
): Promise<{ error: string; status: number } | null> {
    const hasPermission = await userHasRole(userId, allowedRoles);

    if (!hasPermission) {
        const roleName = await getUserRole(userId);
        console.warn(`Unauthorized access attempt: User ${userId} with role ${roleName} tried to access resource requiring roles: ${allowedRoles.join(', ')}`);

        return {
            error: `Forbidden - This action requires one of the following roles: ${allowedRoles.join(', ')}`,
            status: 403,
        };
    }

    return null;
}
