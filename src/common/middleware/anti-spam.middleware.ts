// src/common/middleware/anti-spam.middleware.ts
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const requestTimestamps = new Map<string, number[]>();
const MAX_REQUESTS = 10; // Max request
const TIME_WINDOW_MS = 10_000; // Trong 10 giây

@Injectable()
export class AntiSpamMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    const timestamps = requestTimestamps.get(ip) || [];
    const updated = [...timestamps.filter(ts => now - ts < TIME_WINDOW_MS), now];
    requestTimestamps.set(ip, updated);

    if (updated.length > MAX_REQUESTS) {
      throw new HttpException(`Too many requests from IP: ${ip}`, HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
