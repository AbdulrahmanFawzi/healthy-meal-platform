/**
 * Phone Number Utility
 * 
 * Handles phone number normalization and validation for backward compatibility.
 * 
 * Formats Supported:
 * - Local Saudi format: 05XXXXXXXX (10 digits)
 * - International format: +9665XXXXXXXX (13 characters)
 * 
 * Storage Format:
 * All phone numbers are stored in database as +9665XXXXXXXX
 * 
 * Use Cases:
 * 1. User enters 05XXXXXXXX -> Normalize to +9665XXXXXXXX -> Store
 * 2. User enters +9665XXXXXXXX -> Validate -> Store
 * 3. Existing records with +9665XXXXXXXX -> Continue working
 */

/**
 * Normalize phone number to international format (+9665XXXXXXXX)
 * 
 * @param {string} phone - Phone number in any supported format
 * @returns {string} Normalized phone in format +9665XXXXXXXX
 * @throws {Error} If phone format is invalid
 */
function normalizePhone(phone) {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Remove spaces and trim
  const cleaned = phone.trim().replace(/\s/g, '');

  // Case 1: Local format (05XXXXXXXX)
  if (/^05[0-9]{8}$/.test(cleaned)) {
    return '+966' + cleaned.substring(1); // Remove leading 0, add +966
  }

  // Case 2: International format (+9665XXXXXXXX)
  if (/^\+9665[0-9]{8}$/.test(cleaned)) {
    return cleaned; // Already in correct format
  }

  // Invalid format
  throw new Error('رقم الجوال يجب أن يكون بصيغة 05XXXXXXXX أو +9665XXXXXXXX');
}

/**
 * Validate if phone is in a supported format (before normalization)
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPhoneFormat(phone) {
  if (!phone) return false;

  const cleaned = phone.trim().replace(/\s/g, '');

  // Check local format (05XXXXXXXX) or international (+9665XXXXXXXX)
  return /^05[0-9]{8}$/.test(cleaned) || /^\+9665[0-9]{8}$/.test(cleaned);
}

/**
 * Convert phone to local display format (05XXXXXXXX)
 * For returning to frontend if needed
 * 
 * @param {string} phone - Phone in international format
 * @returns {string} Phone in local format (05XXXXXXXX)
 */
function toLocalFormat(phone) {
  if (!phone) return '';

  const cleaned = phone.trim().replace(/\s/g, '');

  // If already in local format
  if (/^05[0-9]{8}$/.test(cleaned)) {
    return cleaned;
  }

  // Convert from international to local
  if (/^\+9665[0-9]{8}$/.test(cleaned)) {
    return '0' + cleaned.substring(4); // Remove +966, add 0
  }

  return phone; // Return as-is if unrecognized
}

module.exports = {
  normalizePhone,
  isValidPhoneFormat,
  toLocalFormat
};
