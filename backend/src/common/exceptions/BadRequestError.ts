// BadRequestError exception
import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', public errors?: any[]) {
    super(message, 400);
  }
}
