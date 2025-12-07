import { NextRequest, NextResponse } from "next/server";
import { chromium } from "@playwright/test";

export const maxDuration = 60;

interface ScannedEvent {
  eventName: string;
  timestamp: number;
  payload: Record<string, any>;
  selector?: string;
}

interface ScanEventsResponse {
  success: boolean;
  events: ScannedEvent[];
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ScanEventsResponse>> {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, events: [], error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, events: [], error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const events: ScannedEvent[] = [];

    // Launch browser
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Intercept dataLayer push events
    await page.addInitScript(() => {
      // Store original push method
      const originalDataLayerPush = Array.prototype.push;

      // Override window.dataLayer if it doesn't exist
      if (typeof window !== "undefined") {
        (window as any).dataLayer = (window as any).dataLayer || [];

        // Create a proxy to capture pushes
        const capturedEvents: ScannedEvent[] = [];

        // Override push method on dataLayer
        (window as any).dataLayer.push = function (...args: any[]) {
          const eventData = args[0] || {};
          const eventName = eventData.event || eventData.eventName || "unnamed";

          // Capture event
          capturedEvents.push({
            eventName,
            timestamp: Date.now(),
            payload: eventData,
            selector: (document.activeElement as HTMLElement)?.id || undefined,
          });

          // Store in window for later retrieval
          (window as any).__capturedGAEvents = capturedEvents;

          // Call original push
          return originalDataLayerPush.call(this, ...args);
        };
      }

      // Also capture gtag calls
      if (typeof window !== "undefined") {
        const originalGtag = (window as any).gtag;
        (window as any).gtag = function (command: string, eventName?: string, params?: any) {
          if (command === "event" && eventName) {
            const capturedEvents = (window as any).__capturedGAEvents || [];
            capturedEvents.push({
              eventName: eventName,
              timestamp: Date.now(),
              payload: params || {},
              selector: (document.activeElement as HTMLElement)?.id || undefined,
            });
            (window as any).__capturedGAEvents = capturedEvents;
          }

          // Call original gtag if it exists
          if (originalGtag) {
            return originalGtag.call(this, command, eventName, params);
          }
        };
      }
    });

    // Navigate to URL with wait for network idle
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {
      // Continue even if navigation times out
    });

    // Wait a bit for events to be captured
    await page.waitForTimeout(3000);

    // Extract captured events from the page
    const capturedEvents = await page.evaluate(() => {
      return (window as any).__capturedGAEvents || [];
    });

    events.push(...capturedEvents);

    // Close browser
    await context.close();
    await browser.close();

    return NextResponse.json(
      {
        success: true,
        events: events,
        message: `Captured ${events.length} event(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error scanning events:", error);
    return NextResponse.json(
      {
        success: false,
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while scanning events",
      },
      { status: 500 }
    );
  }
}
