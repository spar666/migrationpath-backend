import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', [
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8083',
  ]);

  // --- Security ---
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  });

  // --- API Prefix & Versioning ---
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  // --- Global Interceptors ---
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // --- Global Validation ---
  // Validation: strip unknown properties but do not throw for them.
  // Keeping `whitelist: true` ensures unknown props are removed.
  // Set `forbidNonWhitelisted: false` so clients that mistakenly send
  // system-managed fields (id, created_at, etc.) get those fields stripped
  // instead of a 400 response.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Global Exception Filter ---
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- Graceful Shutdown ---
  app.enableShutdownHooks();

  // --- Swagger Documentation ---
  const config = new DocumentBuilder()
    .setTitle('Australia Migration API')
    .setDescription(
      'The Australia Migration Concierge Platform API — production-ready',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${port}`, 'Local Development')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/docs`);
  logger.log(`💓 Health check at http://localhost:${port}/health`);
  logger.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}
bootstrap();
