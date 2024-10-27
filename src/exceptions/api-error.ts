/**
 * ApiError is a custom error class that extends the built-in Error class.
 * It allows you to pass a status code and an array of errors to the constructor.
 * The status code is used to set the HTTP status code of the response.
 * The errors array is used to pass any additional information about the error.
 * The customStatus property is used to pass a custom status code to the error.
 */
export default class ApiError extends Error {
  /**
   * The HTTP status code of the error.
   */
  private status: number;

  /**
   * An array of errors that provide additional information about the error.
   */
  private errors: any[];
  
  /**
   * A custom status code that can be passed to the error.
   */
  private customStatus?: string;

  /**
   * The constructor function for the ApiError class.
   * @param {number} status The HTTP status code of the error.
   * @param {string} message The message of the error.
   * @param {any[]} errors An array of errors that provide additional information about the error.
   * @param {string} [customStatus] A custom status code that can be passed to the error.
   */
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

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * A static method that returns an ApiError with a status code of 401.
   * @param {string} message The message of the error.
   * @returns {ApiError} The ApiError object.
   */
  public static UnauthorizedError(message: string): ApiError {
    console.log("UnauthorizedError:", message);
    return new ApiError(401, message);
  }

  /**
   * A static method that returns an ApiError with a status code of 400.
   * @param {string} message The message of the error.
   * @param {any[]} [errors] An array of errors that provide additional information about the error.
   * @returns {ApiError} The ApiError object.
   */
  public static BadRequest(message: string, errors: any[] = []): ApiError {
    console.log("BadRequest because of:", message);
    return new ApiError(400, message, errors);
  }

  /**
   * A static method that returns an ApiError with a status code of 404.
   * @param {string} message The message of the error.
   * @returns {ApiError} The ApiError object.
   */
  public static NotFoundError(message: string): ApiError {
    console.log("NotFoundError:", message);
    return new ApiError(404, message);
  }

  /**
   * A static method that returns an ApiError with a status code of 500.
   * @param {string} message The message of the error.
   * @returns {ApiError} The ApiError object.
   */
  public static InternalServerError(message: string): ApiError {
    console.log("InternalServerError:", message);
    return new ApiError(500, message);
  }
}