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

const SUCCESSFUL_STATUS = {
  ok: {
    code: HTTP_STATUS_CODES.ok,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.1",
    title: "OK",
    details: "The request has succeeded.",
  },
  created: {
    code: HTTP_STATUS_CODES.created,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.2",
    title: "Created",
    details:
      "The request has been fulfilled and has resulted in one or more new resources being created.",
  },
  accepted: {
    code: HTTP_STATUS_CODES.accepted,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.3",
    title: "Accepted",
    details:
      "The request has been accepted for processing, but the processing has not been completed.",
  },
  noContent: {
    code: HTTP_STATUS_CODES.noContent,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.5",
    title: "No Content",
    details:
      "The server has successfully fulfilled the request but there is no additional content to send in the response payload body.",
  },
} as const;

const CLIENT_ERROR_STATUS = {
  badRequest: {
    code: HTTP_STATUS_CODES.badRequest,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1",
    title: "Bad Request",
    details:
      "The server cannot or will not process the request due to something that is perceived to be a client error.",
  },
  unauthorized: {
    code: HTTP_STATUS_CODES.unauthorized,
    type: "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
    title: "Unauthorized",
    details:
      "The request has not been applied because it lacks valid authentication credentials for the target resource.",
  },
  forbidden: {
    code: HTTP_STATUS_CODES.forbidden,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.3",
    title: "Forbidden",
    details: "The server understood the request but refuses to authorize it.",
  },
  notFound: {
    code: HTTP_STATUS_CODES.notFound,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4",
    title: "Not Found",
    details:
      "The server did not find a current representation for the target resource or is not willing to disclose that one exists.",
  },
  methodNotAllowed: {
    code: HTTP_STATUS_CODES.methodNotAllowed,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.5",
    title: "Method Not Allowed",
    details:
      "The method received in the request-line is known by the origin server but not supported by the target resource.",
  },
  conflict: {
    code: HTTP_STATUS_CODES.conflict,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.8",
    title: "Conflict",
    details:
      "The request could not be completed due to a conflict with the current state of the target resource.",
  },
  unsupportedMediaType: {
    code: HTTP_STATUS_CODES.unsupportedMediaType,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.13",
    title: "Unsupported Media Type",
    details:
      "The server is refusing to service the request because the payload is in a format not supported by this method on the target resource.",
  },
} as const;

const SERVER_ERROR_STATUS = {
  internalServerError: {
    code: HTTP_STATUS_CODES.internalServerError,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
    title: "Internal Server Error",
    details:
      "The server encountered an unexpected condition that prevented it from fulfilling the request.",
  },
  notImplemented: {
    code: HTTP_STATUS_CODES.notImplemented,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.2",
    title: "Not Implemented",
    details: "The server does not support the functionality required to fulfill the request.",
  },
  badGateway: {
    code: HTTP_STATUS_CODES.badGateway,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.3",
    title: "Bad Gateway",
    details:
      "The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.",
  },
  serviceUnavailable: {
    code: HTTP_STATUS_CODES.serviceUnavailable,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.4",
    title: "Service Unavailable",
    details:
      "The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.",
  },
  gatewayTimeout: {
    code: HTTP_STATUS_CODES.gatewayTimeout,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.5",
    title: "Gateway Timeout",
    details:
      "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access in order to complete the request.",
  },
} as const;

export const HTTP_STATUS = {
  ...SUCCESSFUL_STATUS,
  ...CLIENT_ERROR_STATUS,
  ...SERVER_ERROR_STATUS,
} as const;
