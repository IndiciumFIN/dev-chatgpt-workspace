import { Component, type ErrorInfo, type ReactNode } from 'react';
import { boundaryChangesWithKey, captureBoundary, clearBoundary, type BoundaryState } from './boundary.ts';

type Props = { children: ReactNode; moduleName: string; resetKey: string };

export class ModuleErrorBoundary extends Component<Props, BoundaryState> {
  state: BoundaryState = clearBoundary();

  static getDerivedStateFromError(error: Error): BoundaryState {
    return captureBoundary(error);
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[modulo ${this.props.moduleName}]`, error.message, info.componentStack);
  }

  componentDidUpdate(previous: Props) {
    if (boundaryChangesWithKey(previous.resetKey, this.props.resetKey, this.state.failed)) {
      this.setState(clearBoundary());
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="panel" role="alert">
      <h2>Este módulo não pôde ser exibido</h2>
      <p>A navegação continua disponível. Nada foi aprovado, publicado ou enviado.</p>
      <p>Módulo: {this.props.moduleName}. {this.state.message}</p>
      <button type="button" className="btn" onClick={() => this.setState(clearBoundary())}>Tentar novamente</button>
    </section>;
  }
}
