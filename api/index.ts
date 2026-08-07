import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { normalizeRequestUrl } from '../src/common/middleware/normalize-request-url.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';

/**
 * How long Vercel lets one invocation run.
 *
 * Set here rather than in vercel.json because that file uses the legacy
 * `builds` property, and Vercel rejects a config that carries both `builds`
 * and `functions`. For an @vercel/node function this exported `config` is the
 * supported alternative.
 *
 * 300 is the ceiling on Hobby and also the current default, so this is really
 * documentation: it pins the value against a future change to Vercel's
 * defaults, and states out loud that we want the longest run this plan allows.
 * On Pro the maximum rises to 800s if a cold start ever genuinely needs it.
 *
 * Worth knowing this does NOT give the webhook handler more room. Stripe
 * abandons a delivery after about 30 seconds and records it failed, so for
 * anything Stripe is waiting on, THIRTY seconds is the real budget regardless
 * of what is set here. This only helps slow non-webhook requests — a cold start
 * connecting TypeORM before it can serve, most likely.
 */
export const config = { maxDuration: 300 };

const server = express();
let cachedServer: express.Express;

async function bootstrap(): Promise<express.Express> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      // Required by the Stripe and Calendly webhook controllers, exactly as in
      // main.ts. Both verify a signature computed over the EXACT bytes the
      // provider sent, and parsing the JSON then re-serialising it does not
      // round-trip (key order, unicode escapes, whitespace).
      //
      // This was missing here while main.ts had it, which is the worst shape
      // for a bug of this kind: local development verifies webhooks fine and
      // production rejects every single one. `request.rawBody` is undefined
      // without it, so the controller throws before the signature is even
      // checked — meaning a correct STRIPE_WEBHOOK_SECRET makes no difference,
      // and the failure looks identical to a wrong one.
      //
      // Consequence when absent: payments succeed and bookings never confirm.
      rawBody: true,
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', [
    'http://localhost:3000',
  ]);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  });

  app.setGlobalPrefix(apiPrefix, { exclude: ['health'] });

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Australia Migration API')
    .setDescription(
      'The Australia Migration Concierge Platform API — production-ready',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
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

  await app.init();

  const logger = new Logger('Vercel');
  logger.log(`NestJS app bootstrapped for Vercel`);
  logger.log(`Environment: ${configService.get('app.nodeEnv')}`);

  return server;
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  // There is no HTTP server of ours to hook here — Vercel hands us req/res —
  // so normalise directly before Express's router parses the request target.
  normalizeRequestUrl(req);
  cachedServer(req, res);
}
