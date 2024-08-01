export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export function isHttpMethod(obj: any): obj is HttpMethod {
  return HTTP_METHODS.includes(obj);
}
