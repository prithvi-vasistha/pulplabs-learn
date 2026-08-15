/** An error that carries the status the client should see. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    if (details) this.details = details
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details)
export const unauthorized = (message = 'Sign in to continue') => new HttpError(401, message)
export const forbidden = (message = 'Not allowed') => new HttpError(403, message)
export const notFound = (message = 'Not found') => new HttpError(404, message)
export const conflict = (message) => new HttpError(409, message)
export const tooMany = (message = 'Too many attempts — wait a minute and try again') => new HttpError(429, message)
