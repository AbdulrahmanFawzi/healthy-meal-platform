
export interface Restaurant {
  id: string;           // Unique restaurant ID (used as restaurantId in other collections)
  name: string;         // Restaurant display name
  logoUrl?: string;     // Optional logo displayed in admin/customer headers
  createdAt: string;
}
