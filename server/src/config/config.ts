import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  port: parseInt(process.env.PORT!) || 5000,
  mongo_uri: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  brevo_api: process.env.BREVO_API_KEY,
  frontend_url: process.env.FRONTEND_URL,
  node_env: process.env.NODE_ENV,
  expires_in: process.env.EXPIRES_IN || '7d',
}));
