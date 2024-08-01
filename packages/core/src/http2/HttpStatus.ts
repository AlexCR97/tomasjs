export const HTTP_STATUS_CODES = {
  ok: 200,
  created: 201,
  accepted: 202,
  noContent: 204,

  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  conflict: 409,
  unsupportedMediaType: 415,

  internalServerError: 500,
  notImplemented: 501,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const;

export const HTTP_STATUS_TEXT = {
  200: "ok",
  201: "created",
  202: "accepted",
  204: "noContent",

  400: "badRequest",
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  405: "methodNotAllowed",
  409: "conflict",
  415: "unsupportedMediaType",

  500: "internalServerError",
  501: "notImplemented",
  502: "badGateway",
  503: "serviceUnavailable",
  504: "gatewayTimeout",
} as const;
