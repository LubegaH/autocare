export type ErrorCode =
  | 'configuration_error'
  | 'offline'
  | 'database_unavailable'
  | 'invalid_response'

export type ResultError = {
  code: ErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
  cause?: unknown
}

export type Result<T> =
  { success: true; data: T } | { success: false; error: ResultError }
