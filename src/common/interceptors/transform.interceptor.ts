import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Wraps all successful responses in a standard envelope containing:
 *  - success: true
 *  - data: the response payload
 *  - timestamp: ISO 8601
 *  - path: the request URL
 *  - requestId: correlation ID for tracing
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.correlationId || '-';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: correlationId,
      })),
    );
  }
}
