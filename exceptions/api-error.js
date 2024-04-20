module.exports = class ApiError extends Error {
  status;
  errors;
  customStatus;

  constructor(status, message, errors = [], customStatus) {
    super(message);
    this.status = status,
    this.errors = errors;
    this.customStatus = customStatus;
  }

  static UnauthorizedError(message) {
    console.log('UnauthorizedError:', message);
    return new ApiError(401, message);
  }

  static BadRequest(message, errors = []) {
    console.log('BadRequest because of:', message);
    return new ApiError(400, message, errors);
  }
}