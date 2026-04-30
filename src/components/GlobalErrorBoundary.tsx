import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/components/atoms/ErrorState'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message={this.state.message || 'Ocorreu um erro inesperado.'}
          onRetry={() => this.setState({ hasError: false, message: '' })}
        />
      )
    }
    return this.props.children
  }
}
