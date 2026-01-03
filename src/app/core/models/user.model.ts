/**
 * User roles in the multi-tenant platform:
 * - super_admin: Platform owner, manages all restaurants
 * - admin: Restaurant owner/staff, manages their restaurant only
 * - customer: End user, orders meals from their restaurant
 */
export type UserRole = 'super_admin' | 'admin' | 'customer';


export interface User {
  id: string;
  restaurantId: string | null;  // Tenant isolation key (null for super_admin)
  name: string;
  phone: string;                // Primary login identifier
  email?: string;               // Optional
  role: UserRole;               // Determines access level and dashboard
  createdAt: string;
}
