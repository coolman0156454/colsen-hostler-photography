import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactEmail } from "@/lib/contact";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid contact form data." },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail({
      senderName: parsed.data.name,
      senderEmail: parsed.data.email,
      message: parsed.data.message,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact submission failed", error);
    return NextResponse.json(
      {
        error:
          "Unable to send the message right now. Verify RESEND_API_KEY and CONTACT_TO_EMAIL.",
      },
      { status: 500 },
    );
  }
}

