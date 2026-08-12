export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  farmName: string;
  latitude: number;
  longitude: number;
  unitSystem: 'metric' | 'imperial' | 'us_customary' | 'ethiopian_traditional' | 'mixed';
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: 'Bearer';
}
