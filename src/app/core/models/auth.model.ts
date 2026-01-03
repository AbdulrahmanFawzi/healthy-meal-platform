import { User } from './user.model';
import { Restaurant } from './restaurant.model';


export interface LoginRequest {
  phone: string;       // Format: +9665XXXXXXXX (Saudi phone number)
  password: string;    // Minimum 6 characters
}


export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;           // JWT token for API authentication
    user: User;                    // User object with role and restaurantId
    restaurant: Restaurant | null; // Restaurant context (null for super_admin)
  };
}

/**
 * Authentication state stored in memory and localStorage
 * Represents the current logged-in user session
 */
export interface AuthState {
  accessToken: string;           // JWT for authenticated requests
  user: User;                    // Current user details
  restaurant: Restaurant | null; // Restaurant context for multi-tenancy
}
