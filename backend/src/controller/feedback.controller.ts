import type { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";

interface AppsScriptResponse {
  success?: unknown;
  error?: unknown;
}

function getAppsScriptUrl(): URL | null {
  const configuredUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "script.google.com" ||
      !/^\/macros\/s\/[^/]+\/exec\/?$/.test(url.pathname)
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export const submitFeedback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { rating, feedback } = req.body ?? {};
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof feedback !== "string" ||
      !feedback.trim() ||
      feedback.length > 2000
    ) {
      res.status(400).json({ error: "Choose a 1–5 star rating and enter feedback up to 2,000 characters." });
      return;
    }

    const appsScriptUrl = getAppsScriptUrl();
    if (!appsScriptUrl) {
      res.status(503).json({ error: "Feedback saving is not configured yet. Please try again later." });
      return;
    }

    try {
      const formBody = new URLSearchParams({
        rating: String(rating),
        feedback: feedback.trim(),
      });
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: formBody,
        signal: AbortSignal.timeout(15000),
      });
      const responseText = await response.text();

      let result: AppsScriptResponse;
      try {
        result = JSON.parse(responseText) as AppsScriptResponse;
      } catch {
        console.error("[submitFeedback] Apps Script returned a non-JSON response.");
        res.status(502).json({ error: "Google Forms did not confirm the feedback save. Please try again." });
        return;
      }

      if (!response.ok || result.success !== true) {
        console.error("[submitFeedback] Apps Script did not confirm the save:", result.error);
        res.status(502).json({ error: "Google Forms could not save your feedback. Please try again." });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error(
        "[submitFeedback] Apps Script request failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      res.status(502).json({ error: "We couldn't reach Google Forms to save your feedback. Please try again." });
    }
  },
);
