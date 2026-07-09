"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: process.env.NODE_ENV === 'production'
            ? ['error', 'warn', 'log']
            : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 3000);
    const apiPrefix = configService.get('app.apiPrefix', 'api/v1');
    const corsOrigins = configService.get('app.corsOrigins', [
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8083',
    ]);
    const trustProxy = configService.get('app.trustProxy', 'false');
    if (trustProxy !== 'false') {
        const value = trustProxy === 'true' ? 1 : isNaN(Number(trustProxy)) ? trustProxy : Number(trustProxy);
        app.set('trust proxy', value);
    }
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        maxAge: 86400,
    });
    app.setGlobalPrefix(apiPrefix, {
        exclude: ['health'],
    });
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.enableShutdownHooks();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Australia Migration API')
        .setDescription('The Australia Migration Concierge Platform API — production-ready')
        .setVersion('1.0')
        .addBearerAuth()
        .addServer(`http://localhost:${port}`, 'Local Development')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
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
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`🚀 Server running on http://localhost:${port}`);
    logger.log(`📖 Swagger docs at http://localhost:${port}/docs`);
    logger.log(`💓 Health check at http://localhost:${port}/health`);
    logger.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map