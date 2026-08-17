let sentryDsn: string | undefined
let initialization: Promise<typeof import('@sentry/react')> | undefined

export function initializeMonitoring(
  dsn: string,
): Promise<typeof import('@sentry/react')> {
  sentryDsn = dsn
  initialization ??= import('@sentry/react').then((sentry) => {
    sentry.init({ dsn })
    return sentry
  })

  return initialization
}

export async function captureUnexpectedError(error: unknown) {
  if (!sentryDsn) return

  const sentry = await initializeMonitoring(sentryDsn)
  sentry.captureException(error)
}
