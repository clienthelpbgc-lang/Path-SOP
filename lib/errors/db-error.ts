import {
  BadRequestError,
  ConflictError,
  ValidationError,
} from ".";

function getPostgresErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  if ("cause" in error) {
    return getPostgresErrorCode(error.cause);
  }

  return undefined;
}

export function translateDatabaseError(error: unknown): never {
  switch (getPostgresErrorCode(error)) {
    case "23505":
      throw new ConflictError("Resource already exists.");
    case "23503":
      throw new BadRequestError("Referenced resource does not exist.");
    case "23502":
      throw new ValidationError("Required field is missing.");
    case "23514":
      throw new ValidationError("Constraint validation failed.");
    case "22P02":
      throw new ValidationError("Invalid value.");
  }
  throw error;
}
