import AuthForm from '@/components/auth/AuthForm';
import AuthStatus from '@/components/auth/AuthStatus';
import HudFrame from '@/components/ui/HudFrame';
import SignalWave from '@/components/ui/SignalWave';

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center justify-center px-6 py-14 sm:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <HudFrame tone="cyan" className="flex flex-col justify-between">
          <div>
            <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">ORION-9 // authentication</p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Secure your command deck</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Register or sign in to unlock the rescue interface. Sessions persist under <span className="code-text text-cyan-200">orion9.session</span>.
            </p>
            <div className="mt-6"><AuthStatus /></div>
          </div>
          <div className="mt-8 space-y-3">
            <SignalWave label="handshake · alpha" />
          </div>
        </HudFrame>
        <AuthForm />
      </section>
    </main>
  );
}
