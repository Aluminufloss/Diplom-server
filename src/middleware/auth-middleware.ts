import { Request, Response, NextFunction } from "express";

import ApiError from "../exceptions/api-error";

import tokenService from "../service/token/token-service";

interface AuthenticatedRequest extends Request {
  user?: any; //ToDO: channge to real type later
}

export default function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(
        ApiError.UnauthorizedError("Don't have authorization header")
      );
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError("Don't have access token"));
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(
        ApiError.UnauthorizedError("Token didn't validate correctly")
      );
    }

    req.user = userData;
    next();
  } catch (err) {
    return next(err);
  }
}
