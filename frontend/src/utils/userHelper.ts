/**
 * User Helper Utilities
 * Provides consistent user ID and data access across the application
 */

export interface User {
  id?: string;
  _id?: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  name?: string;
  email?: string;
  role?: string;
  token?: string;
  createdAt?: string;
}

/**
 * Get user ID in consistent format
 * Handles different user object structures (id, _id, userId._id)
 */
export function getUserId(user: User | null | undefined): string | null {
  if (!user) return null;
  
  // Try different possible ID fields
  if (user.id) return user.id;
  if (user._id) return user._id;
  if (user.userId?._id) return user.userId._id;
  
  return null;
}

/**
 * Get user name consistently
 */
export function getUserName(user: User | null | undefined): string {
  if (!user) return 'User';
  
  if (user.name) return user.name;
  if (user.userId?.name) return user.userId.name;
  
  return 'User';
}

/**
 * Get user email consistently
 */
export function getUserEmail(user: User | null | undefined): string {
  if (!user) return '';
  
  if (user.email) return user.email;
  if (user.userId?.email) return user.userId.email;
  
  return '';
}

/**
 * Get user role consistently
 */
export function getUserRole(user: User | null | undefined): string {
  if (!user) return 'student';
  
  return user.role || 'student';
}

/**
 * Normalize user object to consistent format
 */
export function normalizeUser(user: any): User {
  if (!user) return {};
  
  const id = getUserId(user);
  
  return {
    id: id || undefined,
    _id: id || undefined,
    name: getUserName(user),
    email: getUserEmail(user),
    role: getUserRole(user),
    token: user.token,
    createdAt: user.createdAt,
    // Preserve original structure for compatibility
    userId: user.userId
  };
}

/**
 * Get user from localStorage with normalization
 */
export function getUserFromStorage(): User | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return normalizeUser(user);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

/**
 * Save user to localStorage with normalization
 */
export function saveUserToStorage(user: User): void {
  try {
    const normalized = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalized));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
}

/**
 * Clear user from localStorage
 */
export function clearUserFromStorage(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

