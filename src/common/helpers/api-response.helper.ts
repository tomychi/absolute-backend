import { HttpStatus } from '@nestjs/common';

export class ApiResponseHelper<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
  errors?: string[];

  constructor(
    success: boolean,
    message: string,
    data?: T,
    statusCode: number = HttpStatus.OK,
    errors?: string[],
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.errors = errors;
  }

  static success<T>(
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = HttpStatus.OK,
  ): ApiResponseHelper<T> {
    return new ApiResponseHelper(true, message, data, statusCode);
  }

  static error(
    message: string = 'Operation failed',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: string[],
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      statusCode,
      errors,
    );
  }

  static created<T>(
    data?: T,
    message: string = 'Resource created successfully',
  ): ApiResponseHelper<T> {
    return new ApiResponseHelper(true, message, data, HttpStatus.CREATED);
  }

  static noContent(
    message: string = 'Operation completed successfully',
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      true,
      message,
      null,
      HttpStatus.NO_CONTENT,
    );
  }

  static badRequest(
    message: string = 'Bad request',
    errors?: string[],
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.BAD_REQUEST,
      errors,
    );
  }

  static unauthorized(
    message: string = 'Unauthorized access',
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.UNAUTHORIZED,
    );
  }

  static forbidden(
    message: string = 'Access forbidden',
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.FORBIDDEN,
    );
  }

  static notFound(
    message: string = 'Resource not found',
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.NOT_FOUND,
    );
  }

  static conflict(
    message: string = 'Resource conflict',
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.CONFLICT,
    );
  }

  static validationError(
    message: string = 'Validation failed',
    errors: string[],
  ): ApiResponseHelper<null> {
    return new ApiResponseHelper<null>(
      false,
      message,
      null,
      HttpStatus.BAD_REQUEST,
      errors,
    );
  }
}
