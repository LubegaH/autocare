export type ErrorCode =
  | 'configuration_error'
  | 'validation_error'
  | 'unauthenticated'
  | 'unauthorized'
  | 'conflict'
  | 'offline'
  | 'database_unavailable'
  | 'invalid_response'
  | 'unexpected_error'

export type ResultError = {
  code: ErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
  cause?: unknown
}

export type Result<T> =
  { success: true; data: T } | { success: false; error: ResultError }
