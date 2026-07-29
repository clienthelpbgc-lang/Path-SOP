import { AppError } from "./app.error";

export class AuthError extends AppError {
  constructor(message = "Unauthorized.") {
    super(message, 401, "AUTH_ERROR");
  }
}
