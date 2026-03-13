import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? "8080", 10),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/entrega-final",
  jwtSecret: process.env.JWT_SECRET ?? "secretKey",

  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:8080",

  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM ?? "no-reply@ecommerce.local",
  },
};

