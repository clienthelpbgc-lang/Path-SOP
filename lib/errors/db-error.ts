import {
  BadRequestError,
  ConflictError,
  ValidationError,
} from ".";

type PostgresErrorField = "code" | "constraint_name" | "column_name";

function getPostgresErrorField(
  error: unknown,
  field: PostgresErrorField,
): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if (field in error && typeof (error as Record<string, unknown>)[field] === "string") {
    return (error as Record<PostgresErrorField, string>)[field];
  }

  if ("cause" in error) {
    return getPostgresErrorField(error.cause, field);
  }

  return undefined;
}

// Postgres reports the offending column as snake_case (e.g. "period_end")
// -- turn it into something readable for a fallback "X is required" message.
function humanizeColumnName(column: string): string {
  const words = column.split("_");
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
}

// Specific, human-readable messages for every CHECK constraint defined in
// the db schema -- keep this in sync with `check(...)` calls under
// features/*/schema. Falls back to a generic message for any check
// constraint added later that isn't listed here yet.
const CHECK_CONSTRAINT_MESSAGES: Record<string, string> = {
  kras_weightage_range_check: "Weightage must be between 1 and 50.",
  kra_templates_weightage_range_check: "Weightage must be between 1 and 50.",
  kra_template_presets_weightage_range_check:
    "Weightage must be between 1 and 50.",
};

export function translateDatabaseError(error: unknown): never {
  const code = getPostgresErrorField(error, "code");

  switch (code) {
    case "23505":
      throw new ConflictError("Resource already exists.");
    case "23503":
      throw new BadRequestError("Referenced resource does not exist.");
    case "23502": {
      const column = getPostgresErrorField(error, "column_name");
      throw new ValidationError(
        column
          ? `${humanizeColumnName(column)} is required.`
          : "Required field is missing.",
      );
    }
    case "23514": {
      const constraint = getPostgresErrorField(error, "constraint_name");
      throw new ValidationError(
        (constraint && CHECK_CONSTRAINT_MESSAGES[constraint]) ??
          "One of the values provided is outside the allowed range.",
      );
    }
    case "22P02":
      throw new ValidationError("Invalid value.");
  }
  throw error;
}
