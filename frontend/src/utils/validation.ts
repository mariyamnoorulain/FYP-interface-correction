/**
 * Input Validation Utilities
 * Provides consistent validation functions for forms and user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password
 */
export function validatePassword(password: string, minLength: number = 6): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password === '') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  // Optional: Add more password strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate name
 */
export function validateName(name: string, minLength: number = 2): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim() === '') {
    errors.push('Name is required');
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < minLength) {
    errors.push(`Name must be at least ${minLength} characters long`);
  }

  if (trimmedName.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }

  if (typeof value === 'string' && value.trim() === '') {
    errors.push(`${fieldName} cannot be empty`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file
 */
export function validateFile(
  file: File | null,
  allowedTypes?: string[],
  maxSizeMB?: number
): ValidationResult {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('Please select a file');
    return { isValid: false, errors };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isAllowed = allowedTypes.some(type => 
      fileExtension === type.toLowerCase() || 
      mimeType.includes(type.toLowerCase().replace('.', ''))
    );

    if (!isAllowed) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  if (maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url || url.trim() === '') {
    errors.push('URL is required');
    return { isValid: false, errors };
  }

  try {
    new URL(url);
  } catch {
    errors.push('Please enter a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  // Basic phone validation (digits, spaces, hyphens, parentheses, plus)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phone.trim())) {
    errors.push('Please enter a valid phone number');
  }

  // Check minimum length (at least 10 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    errors.push('Phone number must contain at least 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate date
 */
export function validateDate(date: string, minDate?: Date, maxDate?: Date): ValidationResult {
  const errors: string[] = [];
  
  if (!date || date.trim() === '') {
    errors.push('Date is required');
    return { isValid: false, errors };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    errors.push('Please enter a valid date');
    return { isValid: false, errors };
  }

  if (minDate && dateObj < minDate) {
    errors.push(`Date must be after ${minDate.toLocaleDateString()}`);
  }

  if (maxDate && dateObj > maxDate) {
    errors.push(`Date must be before ${maxDate.toLocaleDateString()}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login form
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: string[] = [];
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate signup form
 */
export function validateSignupForm(
  name: string,
  email: string,
  password: string,
  role?: string
): ValidationResult {
  const errors: string[] = [];
  
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  if (role && !['student', 'tutor', 'admin'].includes(role.toLowerCase())) {
    errors.push('Invalid role selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join('. ');
}

