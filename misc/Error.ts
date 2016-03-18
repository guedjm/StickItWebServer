'use strict';

export default class StickItError extends Error {
  httpStatus:number;
  errorCode:number;
  errorSubCode:number;
  message:string;

  constructor(httpStatus:number, errorCode:number, message:string, errorSubCode?:number) {
    super(message);
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
    this.errorSubCode = errorSubCode;
  }

  static invalidRequestError():StickItError {
    return new StickItError(400, 1, "Invalid request");
  }

  static internalServerError():StickItError {
    return new StickItError(500, 1, "Internal server error");
  }
}