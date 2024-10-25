export default class ApiError extends Error {
  status: number;
  errors: any[];
  customStatus?: string;

  constructor(
    status: number,
    message: string,
    errors: any[] = [],
    customStatus?: string
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.customStatus = customStatus;
  }

  static UnauthorizedError(message: string): ApiError {
    console.log("UnauthorizedError:", message);
    return new ApiError(401, message);
  }

  static BadRequest(message: string, errors: any[] = []): ApiError {
    console.log("BadRequest because of:", message);
    return new ApiError(400, message, errors);
  }
}
