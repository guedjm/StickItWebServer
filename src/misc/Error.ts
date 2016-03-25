"use strict";

export default class StickItError extends Error {
  public httpStatus: number;
  public errorCode: number;
  public errorSubCode: number;
  public message: string;

  constructor(httpStatus: number, errorCode: number, message: string, errorSubCode?: number) {
    super(message);
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
    this.errorSubCode = errorSubCode;
  }

  public static invalidRequestError(): StickItError {
    return new StickItError(400, 1, "Invalid request");
  }

  public static internalServerError(): StickItError {
    return new StickItError(500, 1, "Internal server error");
  }
}
