import { Component, type ReactNode } from 'react'
import { captureUnexpectedError } from './sentry.ts'

type MonitoringBoundaryProps = { children: ReactNode }
type MonitoringBoundaryState = { failed: boolean }

export class MonitoringBoundary extends Component<
  MonitoringBoundaryProps,
  MonitoringBoundaryState
> {
  state: MonitoringBoundaryState = { failed: false }

  static getDerivedStateFromError(): MonitoringBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    void captureUnexpectedError(error)
  }

  render() {
    if (this.state.failed) {
      return <p role="alert">AutoCare could not start. Refresh to try again.</p>
    }

    return this.props.children
  }
}
