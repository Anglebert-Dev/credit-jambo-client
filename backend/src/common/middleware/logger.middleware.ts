import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

export const loggerMiddleware = morgan('dev');
