"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setError(payload.error ?? "Unable to send message.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Unable to send message right now.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Name</span>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Message</span>
        <textarea
          required
          minLength={10}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      {status === "success" ? (
        <p className="text-sm text-emerald-500">Message sent successfully.</p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

