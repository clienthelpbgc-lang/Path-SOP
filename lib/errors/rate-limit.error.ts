import { AppError } from "./app.error";

export class RateLimitError extends AppError {
  constructor(
    public readonly retryAfterSeconds: number,
    message = "Too many requests. Please slow down.",
  ) {
    super(message, 429, "RATE_LIMITED");
  }
}
