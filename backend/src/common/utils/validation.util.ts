// Validation helper utilities
import { ValidationError } from 'express-validator';

export const formatValidationErrors = (errors: ValidationError[]) => {
  return errors.map((error) => ({
    field: error.type === 'field' ? error.path : 'unknown',
    message: error.msg,
  }));
};
