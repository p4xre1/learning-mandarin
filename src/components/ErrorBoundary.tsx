import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./ui"

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  failed: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Míngdào render failure", error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="fatal-error">
        <span aria-hidden="true">安</span>
        <h1>Something went wrong</h1>
        <p>
          Your local learning data has not been deleted. Reload the app to try
          again.
        </p>
        <Button onClick={() => window.location.reload()}>Reload app</Button>
      </main>
    )
  }
}
