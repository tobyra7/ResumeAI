"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScannedEvent } from "./EventCrawlerForm";

interface EventsListProps {
  events: ScannedEvent[];
  isLoading?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ events, isLoading = false }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<ScannedEvent | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No events captured yet. Scan a URL to get started.</p>
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Captured Events ({events.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(JSON.stringify(events, null, 2))}
        >
          Copy All
        </Button>
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm truncate">
                  {event.eventName}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(event.timestamp)}
                </p>
                {event.selector && (
                  <p className="text-xs text-gray-400 mt-1">
                    Element: <code className="bg-gray-100 px-1 rounded">{event.selector}</code>
                  </p>
                )}
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                {Object.keys(event.payload).length} params
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <AlertDialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <AlertDialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedEvent.eventName}</AlertDialogTitle>
              <AlertDialogDescription>
                Captured at {formatTimestamp(selectedEvent.timestamp)}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              {selectedEvent.selector && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">DOM Selector</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                    {selectedEvent.selector}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">Event Payload</h4>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(JSON.stringify(selectedEvent.payload, null, 2))
                }
                className="w-full"
              >
                Copy Payload
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Close</AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default EventsList;
