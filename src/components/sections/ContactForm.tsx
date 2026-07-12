"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const field =
  "w-full rounded-xl border border-line-2 bg-panel px-4 py-3 text-ink placeholder:text-dim transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

/**
 * Progressive-enhancement contact form. With no backend wired, a valid submit
 * composes a pre-filled email via the user's mail client (mailto), which keeps
 * the form honest and functional for a static deployment. Swap `onSubmit` for a
 * POST to /api/contact when a backend is available (see CONTENT.md).
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(data: { name: string; email: string; message: string }): Errors {
    const e: Errors = {};
    if (!data.name.trim()) e.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Enter a valid email address.";
    if (data.message.trim().length < 10) e.message = "A little more detail helps us respond well.";
    return e;
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      org: (form.elements.namedItem("org") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = form.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const subject = encodeURIComponent(`Inquiry from ${data.name}${data.org ? ` (${data.org})` : ""}`);
    const body = encodeURIComponent(
      `${data.message}\n\n— ${data.name}\n${data.email}${data.org ? `\n${data.org}` : ""}`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby="form-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" autoComplete="name" className={cn(field, errors.name && "border-red-500/60")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
          {errors.name && <p id="name-err" className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={cn(field, errors.email && "border-red-500/60")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
          {errors.email && <p id="email-err" className="text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="org" className="text-sm font-medium text-ink">
          Organization <span className="text-dim">(optional)</span>
        </label>
        <input id="org" name="org" autoComplete="organization" className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-ink">
          Where is value leaking?
        </label>
        <textarea id="message" name="message" rows={5} className={cn(field, "resize-y", errors.message && "border-red-500/60")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} />
        {errors.message && <p id="message-err" className="text-xs text-red-500">{errors.message}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg">
          Send message
        </Button>
        <p id="form-note" className="text-xs text-dim" role={sent ? "status" : undefined}>
          {sent
            ? "Your email client should now be open with a pre-filled message."
            : `Opens your mail client, or write us directly at ${site.email}.`}
        </p>
      </div>
    </form>
  );
}
