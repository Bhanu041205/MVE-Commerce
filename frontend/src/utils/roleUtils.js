export const normalizeRole = (role) => String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');

export const hasRole = (user, requiredRole) => normalizeRole(user?.role) === normalizeRole(requiredRole);

export const isAdminUser = (user) => hasRole(user, 'ADMIN');

export const isCustomerUser = (user) => hasRole(user, 'CUSTOMER');
