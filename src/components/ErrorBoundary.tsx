'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Trega Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-6 text-center text-red-400">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
