import { BaseError } from "./BaseError";

export class ValidationError extends BaseError {
  constructor(message = "Validation failed") {
    super(message, 400, true);
  }
}
