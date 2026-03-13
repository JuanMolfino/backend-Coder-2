import nodemailer from "nodemailer";
import { env } from "./env.js";

export function buildTransporter() {
  if (!env.mail.host || !env.mail.port || !env.mail.user || !env.mail.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });
}

