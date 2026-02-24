import { StatusCodes } from "http-status-codes";

export const HTTP_STATUS_CODE = {
  ok: StatusCodes.OK,
  created: StatusCodes.CREATED,
  noContent: StatusCodes.NO_CONTENT,

  badRequest: StatusCodes.BAD_REQUEST,
  unauthorized: StatusCodes.UNAUTHORIZED,
  forbidden: StatusCodes.FORBIDDEN,
  notFound: StatusCodes.NOT_FOUND,
  conflict: StatusCodes.CONFLICT,
  tooManyRequests: StatusCodes.TOO_MANY_REQUESTS,
  unprocessableEntity: StatusCodes.UNPROCESSABLE_ENTITY,

  internalServerError: StatusCodes.INTERNAL_SERVER_ERROR,
  badGateway: StatusCodes.BAD_GATEWAY,
  serviceUnavailable: StatusCodes.SERVICE_UNAVAILABLE,
} as const;
