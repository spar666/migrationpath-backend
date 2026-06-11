declare const _default: () => {
    app: {
        port: number;
        nodeEnv: string;
        apiPrefix: string;
        corsOrigins: string[];
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
};
export default _default;
