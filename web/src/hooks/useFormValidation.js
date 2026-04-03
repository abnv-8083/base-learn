/**
 * useFormValidation — Lightweight form validation hook
 *
 * Usage:
 *   const { errors, validate, clearError } = useFormValidation();
 *
 *   const isValid = validate({
 *     name:  { value: name,  rules: ['required', 'min:2', 'max:60', 'name'] },
 *     phone: { value: phone, rules: ['phone'] },
 *     email: { value: email, rules: ['required', 'email'] },
 *   });
 */

import { useState } from 'react';

const VALIDATORS = {
  required: (v) => (!v || String(v).trim() === '') ? 'This field is required' : null,
  email:    (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : null,
  phone:    (v) => v && !/^\+?[\d\s\-()]{7,15}$/.test(v) ? 'Enter a valid phone number' : null,
  name:     (v) => v && /[^a-zA-Z\s'.\-]/.test(v) ? 'Name can only contain letters and spaces' : null,
  url:      (v) => v && !/^https?:\/\/.+/.test(v) ? 'Enter a valid URL (starting with http/https)' : null,
  nonempty: (v) => (!v || String(v).trim() === '') ? 'Cannot be empty' : null,
};

function applyRule(rule, value) {
  if (rule.startsWith('min:')) {
    const min = parseInt(rule.split(':')[1], 10);
    if (value && String(value).trim().length < min) return `Must be at least ${min} characters`;
    return null;
  }
  if (rule.startsWith('max:')) {
    const max = parseInt(rule.split(':')[1], 10);
    if (value && String(value).trim().length > max) return `Must be ${max} characters or fewer`;
    return null;
  }
  if (rule.startsWith('minVal:')) {
    const min = parseFloat(rule.split(':')[1]);
    if (value !== '' && value !== undefined && parseFloat(value) < min) return `Value must be at least ${min}`;
    return null;
  }
  if (rule === 'digits') {
    if (value && !/^\d+$/.test(value)) return 'Must contain only digits';
    return null;
  }
  return VALIDATORS[rule] ? VALIDATORS[rule](value) : null;
}

export function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = (fields) => {
    const newErrors = {};
    for (const [field, config] of Object.entries(fields)) {
      const { value, rules = [], label } = config;
      for (const rule of rules) {
        const msg = applyRule(rule, value);
        if (msg) {
          newErrors[field] = label ? `${label}: ${msg}` : msg;
          break; // Stop at first error per field
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const clearAll = () => setErrors({});

  return { errors, validate, clearError, clearAll };
}

/** Helper to get field error style for inputs */
export function getFieldStyle(hasError, baseStyle = {}) {
  return {
    ...baseStyle,
    borderColor: hasError ? '#ef4444' : '#e2e8f0',
    boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
  };
}

/** Inline error message component */
export function FieldError({ message }) {
  if (!message) return null;
  return (
    <span style={{
      display: 'block',
      marginTop: '5px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#dc2626',
      letterSpacing: '0.01em',
    }}>
      ⚠ {message}
    </span>
  );
}
