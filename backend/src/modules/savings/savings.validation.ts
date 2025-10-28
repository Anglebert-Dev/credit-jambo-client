import { body, query } from 'express-validator';

export const depositValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

export const withdrawValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

export const getTransactionsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const createAccountValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('initialDeposit').optional().isFloat({ min: 0 }).withMessage('Initial deposit must be a positive number'),
];

export const updateAccountValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
];
