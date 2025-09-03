export class ApplicationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
export class AuthenticationError extends ApplicationError {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
