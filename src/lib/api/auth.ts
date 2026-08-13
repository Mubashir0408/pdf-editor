import { apiClient } from "../api-client";

/** Fires the post-signup "Welcome to PDF Editor" email. Best-effort only —
 *  callers should never let a failure here block or fail the signup flow
 *  itself, since account creation already succeeded by the time this runs. */
export async function sendWelcomeEmail(email: string): Promise<void> {
  await apiClient.post("/auth/welcome-email", { email });
}
