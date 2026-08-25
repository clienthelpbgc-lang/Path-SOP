import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER) {
  throw new Error("EMAIL_USER is not configured");
}

if (!process.env.EMAIL_APP_PASSWORD) {
  throw new Error("EMAIL_APP_PASSWORD is not configured");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
});
