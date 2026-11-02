import { createRoot } from 'react-dom/client';
import { MobileShell } from './components/mobile-shell';
import { readInitialSession } from './session-bootstrap';
import './styles/globals.css';
import './styles/fonts.css';
const root=createRoot(document.getElementById('root')!);
async function start(){
 try {
  const initialAuthSession=await readInitialSession();
  root.render(<main className="min-h-dvh w-full overflow-hidden bg-[var(--shell-canvas)]"><MobileShell initialAuthSession={initialAuthSession}/></main>);
 } catch {
  root.render(<main role="alert"><p>暂时无法连接服务，请检查后端是否启动。</p><button onClick={()=>void start()}>重试</button></main>);
 }
}
void start();
