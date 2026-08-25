export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  // FormData bodies (file uploads) must keep the browser-generated
  // multipart boundary in Content-Type, so don't override it with JSON.
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(input, {
    ...init,
    headers: isFormData
      ? init?.headers
      : {
          "Content-Type": "application/json",
          ...init?.headers,
        },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!body.success) {
    throw new ApiClientError(
      body.error.message,
      body.error.code,
      response.status,
      body.error.details,
    );
  }

  return body.data;
}
