import { Resend } from "resend";
import { z } from "zod";

import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { logger } from "@/lib/server/logger";
import { env } from "@/lib/server/env";

const welcomeEmailBodySchema = z.object({
  email: z.string().email(),
});

/**
 * Fire-and-forget signup confirmation email. Account creation itself is
 * entirely handled by Supabase Auth on the client — this route only sends
 * the "Welcome to PDF Editor" email afterward, and never fails the request
 * even if Resend errors or `RESEND_API_KEY` isn't configured, since a
 * missing welcome email must never block signup.
 */
export const POST = apiHandler(async (req) => {
  const { email } = parseOrThrow(welcomeEmailBodySchema, await readJsonBody(req), "request body");

  if (!env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — skipping signup welcome email");
    return sendSuccess({ sent: false }, "Welcome email skipped");
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    // The SDK resolves with `{ data, error }` rather than throwing on
    // API-level failures (e.g. an unverified sender/recipient) — only
    // network/unexpected errors land in the catch block below.
    const { error: sendError } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Welcome to PDF Editor",
      text: `Welcome to PDF Editor!\n\nYour PDF Editor account (${email}) was created successfully. You can now sign in and start using every tool.\n\n— The PDF Editor Team`,
      html: `<p>Welcome to PDF Editor!</p><p>Your PDF Editor account (<strong>${email}</strong>) was created successfully. You can now sign in and start using every tool.</p><p>— The PDF Editor Team</p>`,
    });

    if (sendError) {
      logger.error({ sendError }, "Resend rejected signup welcome email");
      return sendSuccess({ sent: false }, "Welcome email failed");
    }

    return sendSuccess({ sent: true }, "Welcome email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send signup welcome email");
    return sendSuccess({ sent: false }, "Welcome email failed");
  }
});
