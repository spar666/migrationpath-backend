declare const _default: () => {
    app: {
        port: number;
        nodeEnv: string;
        apiPrefix: string;
        corsOrigins: string[];
        trustProxy: string;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
    };
    database: {
        url: string | undefined;
        host: string | undefined;
        port: number;
        user: string | undefined;
        password: string | undefined;
        name: string | undefined;
        ssl: string | undefined;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    strapi: {
        url: string;
        apiToken: string | undefined;
    };
    notifications: {
        smtp: {
            host: string | undefined;
            port: number;
            user: string | undefined;
            pass: string | undefined;
            from: string | undefined;
        };
        slackWebhookUrl: string | undefined;
        leadNotificationEmail: string | undefined;
        adminBaseUrl: string | undefined;
    };
};
export default _default;
