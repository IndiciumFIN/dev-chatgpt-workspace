import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Isolate a failing admin surface; do not infer remote state from a UI error. */
type Props={children:ReactNode; moduleName:string};
type State={failed:boolean};
export class AdminErrorBoundary extends Component<Props,State>{
 state:State={failed:false};
 static getDerivedStateFromError():State{return {failed:true};}
 componentDidCatch(error:Error,info:ErrorInfo){
  console.error('[admin-module-render-failed]',this.props.moduleName,error.message,info.componentStack);
 }
 render(){
  if(!this.state.failed)return this.props.children;
  return <section className="ce-admin-panel" role="alert" aria-live="assertive">
   <div className="ce-admin-panel-heading"><div>
    <h2>Módulo temporariamente indisponível</h2>
    <p>Falha ao apresentar {this.props.moduleName}. Os outros módulos continuam acessíveis. Nenhum dado foi salvo ou publicado por esta recuperação.</p>
   </div></div>
   <button type="button" className="ce-admin-btn" onClick={()=>this.setState({failed:false})}>Tentar carregar novamente</button>
  </section>;
 }
}
