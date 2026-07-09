import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Config
import { configuration, configValidationSchema } from './config';

// Core modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AppCacheModule } from './common/cache/cache.module';

// Domain modules
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';

import { PricingModule } from './pricing/pricing.module';
import { LeadsModule } from './leads/leads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvitationModule } from './invitation/invitation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { OccupationsModule } from './occupations/occupations.module';
import { PointsEngineModule } from './points-engine/points-engine.module';
import { VisaRecommendationModule } from './visa-recommendation/visa-recommendation.module';
import { ConsultationModule } from './consultation/consultation.module';
import { CoursesModule } from './courses/courses.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { CmsModule } from './cms/cms.module';
import { MigrationRuleModule } from './migration-rules/migration-rule.module';
import { StatsModule } from './stats/stats.module';
import { PartnerModule } from './partner/partner.module';
import { ParentModule } from './parent/parent.module';
import { PolicyConfigModule } from './policy-config/policy-config.module';
import { RegionalPostcodeModule } from './regional-postcode/regional-postcode.module';
import { DataFreshnessModule } from './data-freshness/data-freshness.module';
import { SiteConfigModule } from './site-config/site-config.module';

// Middleware
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    // --- Configuration with validation ---
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    // --- Rate Limiting ---
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
          limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
        },
      ],
    }),

    // --- Infrastructure ---
    DatabaseModule,
    HealthModule,
    AppCacheModule,

    // --- Domain ---
    AuthModule,
    UserProfileModule,
    PricingModule,
    LeadsModule,
    AnalyticsModule,
    InvitationModule,
    NotificationsModule,
    AdminModule,
    SearchModule,
    OccupationsModule,
    PointsEngineModule,
    VisaRecommendationModule,
    PartnerModule,
    ParentModule,
    PolicyConfigModule,
    RegionalPostcodeModule,
    DataFreshnessModule,
    SiteConfigModule,
    ConsultationModule,
    CoursesModule,
    UserProgressModule,
    CmsModule,
    MigrationRuleModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
