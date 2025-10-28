import { body, query } from 'express-validator';

export const requestCreditValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('purpose').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Purpose must be between 10 and 500 characters'),
  body('durationMonths').isInt({ min: 1, max: 120 }).withMessage('Duration must be between 1 and 120 months'),
];

export const getCreditRequestsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
];

export const repaymentValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
];

export const getRepaymentHistoryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
