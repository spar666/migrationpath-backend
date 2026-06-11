"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_2 = require("./config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const health_module_1 = require("./health/health.module");
const cache_module_1 = require("./common/cache/cache.module");
const auth_module_1 = require("./auth/auth.module");
const user_profile_module_1 = require("./user-profile/user-profile.module");
const pricing_module_1 = require("./pricing/pricing.module");
const analytics_module_1 = require("./analytics/analytics.module");
const invitation_module_1 = require("./invitation/invitation.module");
const notifications_module_1 = require("./notifications/notifications.module");
const admin_module_1 = require("./admin/admin.module");
const search_module_1 = require("./search/search.module");
const universities_module_1 = require("./universities/universities.module");
const occupations_module_1 = require("./occupations/occupations.module");
const points_engine_module_1 = require("./points-engine/points-engine.module");
const visa_recommendation_module_1 = require("./visa-recommendation/visa-recommendation.module");
const consultation_module_1 = require("./consultation/consultation.module");
const courses_module_1 = require("./courses/courses.module");
const user_progress_module_1 = require("./user-progress/user-progress.module");
const cms_module_1 = require("./cms/cms.module");
const migration_rule_module_1 = require("./migration-rules/migration-rule.module");
const stats_module_1 = require("./stats/stats.module");
const correlation_id_middleware_1 = require("./common/middleware/correlation-id.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(correlation_id_middleware_1.CorrelationIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.configuration],
                validationSchema: config_2.configValidationSchema,
                validationOptions: {
                    abortEarly: false,
                    allowUnknown: true,
                },
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
                        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
                    },
                ],
            }),
            database_module_1.DatabaseModule,
            health_module_1.HealthModule,
            cache_module_1.AppCacheModule,
            auth_module_1.AuthModule,
            user_profile_module_1.UserProfileModule,
            pricing_module_1.PricingModule,
            analytics_module_1.AnalyticsModule,
            invitation_module_1.InvitationModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            search_module_1.SearchModule,
            universities_module_1.UniversitiesModule,
            occupations_module_1.OccupationsModule,
            points_engine_module_1.PointsEngineModule,
            visa_recommendation_module_1.VisaRecommendationModule,
            consultation_module_1.ConsultationModule,
            courses_module_1.CoursesModule,
            user_progress_module_1.UserProgressModule,
            cms_module_1.CmsModule,
            migration_rule_module_1.MigrationRuleModule,
            stats_module_1.StatsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map