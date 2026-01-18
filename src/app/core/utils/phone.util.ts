/**
 * Phone Number Utility
 * 
 * Handles conversion between local Saudi format (05XXXXXXXX) 
 * and international format (+9665XXXXXXXX) for backward compatibility.
 * 
 * Backend stores all numbers as +9665XXXXXXXX
 * Frontend displays and accepts 05XXXXXXXX
 */

/**
 * Convert phone number to local Saudi format (05XXXXXXXX)
 * @param phone - Phone number in any supported format
 * @returns Local format: 05XXXXXXXX
 */
export function toLocalFormat(phone: string): string {
  if (!phone) return '';
  
  // Remove any spaces
  const cleaned = phone.trim().replace(/\s/g, '');
  
  // If already in local format (05XXXXXXXX)
  if (/^05[0-9]{8}$/.test(cleaned)) {
    return cleaned;
  }
  
  // If in international format (+9665XXXXXXXX)
  if (/^\+9665[0-9]{8}$/.test(cleaned)) {
    return '0' + cleaned.substring(4); // Remove +966 and prepend 0
  }
  
  // Return as-is if unrecognized format
  return phone;
}

/**
 * Convert phone number to international format (+9665XXXXXXXX)
 * @param phone - Phone number in any supported format
 * @returns International format: +9665XXXXXXXX
 */
export function toInternationalFormat(phone: string): string {
  if (!phone) return '';
  
  // Remove any spaces
  const cleaned = phone.trim().replace(/\s/g, '');
  
  // If in local format (05XXXXXXXX)
  if (/^05[0-9]{8}$/.test(cleaned)) {
    return '+966' + cleaned.substring(1); // Remove 0 and prepend +966
  }
  
  // If already in international format (+9665XXXXXXXX)
  if (/^\+9665[0-9]{8}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Return as-is if unrecognized format
  return phone;
}

/**
 * Validate if phone number is in a supported format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneFormat(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.trim().replace(/\s/g, '');
  
  // Check if matches either local or international format
  return /^05[0-9]{8}$/.test(cleaned) || /^\+9665[0-9]{8}$/.test(cleaned);
}
