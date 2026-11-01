import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { failed: boolean; message: string };

export class ModuleBoundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { failed: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { failed: true, message: error.message || 'Falha sem mensagem' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[console administrativo]', error.message, info.componentStack);
  }

  componentDidUpdate(previous: { resetKey: string }) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false, message: '' });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="ce-admin-panel" role="alert">
      <h2>Este módulo não pôde ser exibido</h2>
      <p>A navegação continua disponível. Nada foi aprovado, publicado ou enviado.</p>
      <p>{this.state.message}</p>
      <button type="button" className="ce-admin-btn" onClick={() => this.setState({ failed: false, message: '' })}>Tentar novamente</button>
    </section>;
  }
}
