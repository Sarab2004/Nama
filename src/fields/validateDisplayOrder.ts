import type { NumberFieldSingleValidation } from 'payload'

export const validateDisplayOrder: NumberFieldSingleValidation = (value) => {
  if (value == null) return true
  if (typeof value === 'number' && value < 0) {
    return 'ترتیب نمایش نمی‌تواند منفی باشد.'
  }
  return true
}
