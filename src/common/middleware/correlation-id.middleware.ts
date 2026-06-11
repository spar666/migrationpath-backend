import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Assigns a unique correlation ID to every request.
 * If the client sends an `X-Request-ID` header, that value is reused;
 * otherwise a new UUID v4 is generated.
 *
 * The ID is available on `req['correlationId']` and is echoed
 * back in the `X-Request-ID` response header.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-request-id'] as string) || randomUUID();

    // Attach to request so interceptors / filters can use it
    (req as any).correlationId = correlationId;

    // Echo back to client
    res.setHeader('X-Request-ID', correlationId);

    next();
  }
}
