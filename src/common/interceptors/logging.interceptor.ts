import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Production-grade logging interceptor.
 *  - Logs method, URL, status code, response time
 *  - Includes correlation ID for request tracing
 *  - Includes authenticated user ID when available
 *  - Uses structured JSON in production
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const correlationId = request.correlationId || '-';
    const userId = request.user?.userId || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - now;
          const statusCode = response.statusCode;
          this.logger.log(
            `[${correlationId}] ${method} ${url} ${statusCode} ${delay}ms | user=${userId}`,
          );
        },
        error: (err) => {
          const delay = Date.now() - now;
          const statusCode = err?.status || err?.getStatus?.() || 500;
          this.logger.error(
            `[${correlationId}] ${method} ${url} ${statusCode} ${delay}ms | user=${userId} | error=${err.message}`,
          );
        },
      }),
    );
  }
}
