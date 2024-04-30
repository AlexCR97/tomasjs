const successfulStatus = {
  ok: {
    code: 200,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.1",
    title: "OK",
    details: "The request has succeeded.",
  },
  created: {
    code: 201,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.2",
    title: "Created",
    details:
      "The request has been fulfilled and has resulted in one or more new resources being created.",
  },
  accepted: {
    code: 202,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.3",
    title: "Accepted",
    details:
      "The request has been accepted for processing, but the processing has not been completed.",
  },
  noContent: {
    code: 204,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.5",
    title: "No Content",
    details:
      "The server has successfully fulfilled the request but there is no additional content to send in the response payload body.",
  },
} as const;

const clientErrorStatus = {
  badRequest: {
    code: 400,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1",
    title: "Bad Request",
    details:
      "The server cannot or will not process the request due to something that is perceived to be a client error.",
  },
  unauthorized: {
    code: 401,
    type: "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
    title: "Unauthorized",
    details:
      "The request has not been applied because it lacks valid authentication credentials for the target resource.",
  },
  forbidden: {
    code: 403,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.3",
    title: "Forbidden",
    details: "The server understood the request but refuses to authorize it.",
  },
  notFound: {
    code: 404,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4",
    title: "Not Found",
    details:
      "The server did not find a current representation for the target resource or is not willing to disclose that one exists.",
  },
  methodNotAllowed: {
    code: 405,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.5",
    title: "Method Not Allowed",
    details:
      "The method received in the request-line is known by the origin server but not supported by the target resource.",
  },
  conflict: {
    code: 409,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.8",
    title: "Conflict",
    details:
      "The request could not be completed due to a conflict with the current state of the target resource.",
  },
  unsupportedMediaType: {
    code: 415,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.13",
    title: "Unsupported Media Type",
    details:
      "The server is refusing to service the request because the payload is in a format not supported by this method on the target resource.",
  },
} as const;

const serverErrorStatus = {
  internalServerError: {
    code: 500,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
    title: "Internal Server Error",
    details:
      "The server encountered an unexpected condition that prevented it from fulfilling the request.",
  },
  notImplemented: {
    code: 501,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.2",
    title: "Not Implemented",
    details: "The server does not support the functionality required to fulfill the request.",
  },
  badGateway: {
    code: 502,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.3",
    title: "Bad Gateway",
    details:
      "The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.",
  },
  serviceUnavailable: {
    code: 503,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.4",
    title: "Service Unavailable",
    details:
      "The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.",
  },
  gatewayTimeout: {
    code: 504,
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.5",
    title: "Gateway Timeout",
    details:
      "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access in order to complete the request.",
  },
} as const;

export const httpStatus = {
  ...successfulStatus,
  ...clientErrorStatus,
  ...serverErrorStatus,
} as const;
