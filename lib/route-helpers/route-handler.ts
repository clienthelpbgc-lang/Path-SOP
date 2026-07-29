import { handleError } from "./handle-error";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function routeHandler<T, C = any>(
  handler: (request: Request, context: C) => Promise<T>,
) {
  return async (request: Request, context: C) => {
    try {
      const data = await handler(request, context);

      return Response.json({
        success: true,
        data,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}
