"use client";

import React, { useState } from "react";
import PageWrapper from "@/components/common/PageWrapper";
import Header from "@/components/layout/Header";
import EventCrawlerForm, { ScannedEvent } from "@/components/layout/event-crawler/EventCrawlerForm";
import EventsList from "@/components/layout/event-crawler/EventsList";

const EventCrawlerPage = () => {
  const [events, setEvents] = useState<ScannedEvent[]>([]);
  const [lastScannedUrl, setLastScannedUrl] = useState<string>("");

  const handleScan = (scannedEvents: ScannedEvent[]) => {
    setEvents(scannedEvents);
  };

  return (
    <PageWrapper>
      <Header />
      <div className="my-10 mx-10 md:mx-20 lg:mx-36">
        <h2 className="text-2xl font-bold mb-2">Event Crawler</h2>
        <p className="text-gray-600 mb-8">
          Scan websites to detect and analyze Google Analytics (GA/GA4/GTM) events.
          This tool captures all dataLayer pushes and gtag events from the page.
        </p>

        <div className="bg-white rounded-lg border p-6 mb-8">
          <EventCrawlerForm onScan={handleScan} />
        </div>

        {events.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <EventsList events={events} />
          </div>
        )}

        {events.length === 0 && (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed p-8 text-center">
            <p className="text-gray-500">
              Enter a URL and click "Scan Events" to see captured analytics events
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default EventCrawlerPage;
