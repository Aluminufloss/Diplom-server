class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message) {
    throw new ApiError(400, message);
  }

  static UnauthorizedError(message) {
    throw new ApiError(401, message);
  }
}

module.exports = ApiError;
