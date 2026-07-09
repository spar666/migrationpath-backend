import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter with production-ready features:
 *  - Includes correlation ID in error responses
 *  - Hides stack traces in production (NODE_ENV !== 'development')
 *  - Structured error logging
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as any).correlationId || '-';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message || exceptionResponse
        : exceptionResponse;

    // Skip logging noisy 404s like browser default requests
    const isNoisy404 =
      status === HttpStatus.NOT_FOUND &&
      ['/favicon.ico', '/sw.js'].includes(request.url);

    if (!isNoisy404) {
      this.logger.error(
        `[${correlationId}] ${request.method} ${request.url} ${status} | ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse: Record<string, any> = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: correlationId,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR && isProduction
          ? 'Internal server error'
          : message,
    };

    // Include stack trace only in development
    if (!isProduction && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
