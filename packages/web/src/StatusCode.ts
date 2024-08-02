import { httpStatus } from "./HttpStatus";

export const statusCode = {
  ok: httpStatus.ok.code,
  created: httpStatus.created.code,
  accepted: httpStatus.accepted.code,
  noContent: httpStatus.noContent.code,

  badRequest: httpStatus.badRequest.code,
  unauthorized: httpStatus.unauthorized.code,
  forbidden: httpStatus.forbidden.code,
  notFound: httpStatus.notFound.code,
  methodNotAllowed: httpStatus.methodNotAllowed.code,
  conflict: httpStatus.conflict.code,
  unsupportedMediaType: httpStatus.unsupportedMediaType.code,

  internalServerError: httpStatus.internalServerError.code,
  notImplemented: httpStatus.notImplemented.code,
  badGateway: httpStatus.badGateway.code,
  serviceUnavailable: httpStatus.serviceUnavailable.code,
  gatewayTimeout: httpStatus.gatewayTimeout.code,
} as const;
