import { Resend } from "resend";

import { env } from "@/lib/env";

type ContactEmailPayload = {
  senderName: string;
  senderEmail: string;
  message: string;
};

export const sendContactEmail = async ({
  senderName,
  senderEmail,
  message,
}: ContactEmailPayload) => {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!env.contactToEmail) {
    throw new Error("CONTACT_TO_EMAIL is not configured.");
  }

  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: env.contactFromEmail,
    to: env.contactToEmail,
    replyTo: senderEmail,
    subject: `New inquiry from ${senderName}`,
    text: `Name: ${senderName}\nEmail: ${senderEmail}\n\n${message}`,
  });
};

