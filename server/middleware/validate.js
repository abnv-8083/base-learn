/**
 * Lightweight validation middleware for Express routes.
 * No third-party dependencies — pure JS.
 *
 * Usage in routes:
 *   router.put('/profile', protect, validate(profileRules), updateProfile);
 */

const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkRule(rule, value, fieldLabel) {
  // Skip validation if field is absent/empty AND rule is not 'required'
  if ((value === undefined || value === null || value === '') && rule !== 'required') return null;

  if (rule === 'required') {
    return (!value || String(value).trim() === '') ? `${fieldLabel} is required` : null;
  }
  if (rule === 'email') {
    return !EMAIL_REGEX.test(value) ? `${fieldLabel} must be a valid email address` : null;
  }
  if (rule === 'phone') {
    return !PHONE_REGEX.test(value) ? `${fieldLabel} must be a valid phone number` : null;
  }
  if (rule === 'name') {
    return /[^a-zA-Z\s'.\-]/.test(value) ? `${fieldLabel} can only contain letters and spaces` : null;
  }
  if (rule.startsWith('min:')) {
    const n = parseInt(rule.split(':')[1], 10);
    return String(value).trim().length < n ? `${fieldLabel} must be at least ${n} characters` : null;
  }
  if (rule.startsWith('max:')) {
    const n = parseInt(rule.split(':')[1], 10);
    return String(value).trim().length > n ? `${fieldLabel} must be ${n} characters or fewer` : null;
  }
  return null;
}

/**
 * @param {Object} schema - { fieldName: { rules: string[], label?: string } }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = {};

    for (const [field, config] of Object.entries(schema)) {
      const { rules = [], label = field } = config;
      const value = req.body[field];

      for (const rule of rules) {
        const error = checkRule(rule, value, label);
        if (error) {
          errors[field] = error;
          break; // Stop at first error per field
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'Validation failed. Please check the form and try again.',
        errors,
      });
    }

    next();
  };
}

module.exports = { validate };
