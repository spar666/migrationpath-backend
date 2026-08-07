import { configValidationSchema as s } from './src/config/config.validation';
const r = s.validate({ JWT_SECRET: 'x', STRIPE_SECRET_KEY: '', CALENDLY_WEBHOOK_SIGNING_KEY: '', SMTP_HOST: '' }, { abortEarly: false, allowUnknown: true });
console.log(r.error ? r.error.details.map(d => d.message).join('\n') : 'VALID');
