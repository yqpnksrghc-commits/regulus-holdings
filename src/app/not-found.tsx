import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="container-lab relative flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="font-mono text-sm text-dim">404</p>
        <h1 className="text-h1">This path recovered nothing.</h1>
        <p className="max-w-md text-lead text-ink-soft">
          The page you are looking for does not exist — or has moved. Let&apos;s get you back to
          something useful.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/">Return home</Button>
          <Button href="/solutions" variant="secondary">
            Explore solutions
          </Button>
        </div>
      </div>
    </section>
  );
}
