import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
          Contact
        </p>
        <h1 className="font-heading text-5xl uppercase tracking-wide">
          Let&apos;s Create
        </h1>
        <p className="max-w-lg text-zinc-600 dark:text-zinc-400">
          For sports game coverage, team media day shoots, portraits, and events,
          send details below and I&apos;ll reply as soon as possible.
        </p>
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Available for school athletics, clubs, and individual sessions.</p>
          <p>Turnaround times and pricing depend on shoot scope.</p>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}

