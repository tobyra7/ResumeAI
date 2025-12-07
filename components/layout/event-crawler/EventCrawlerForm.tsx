"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export interface ScannedEvent {
  eventName: string;
  timestamp: number;
  payload: Record<string, any>;
  selector?: string;
}

interface EventCrawlerFormProps {
  onScan: (events: ScannedEvent[]) => void;
  isLoading?: boolean;
}

const EventCrawlerForm: React.FC<EventCrawlerFormProps> = ({
  onScan,
  isLoading = false,
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/scan-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan events");
      }

      onScan(data.events);
      toast({
        title: "Success",
        description: `Captured ${data.events.length} event(s)`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleScan} className="w-full space-y-4">
      <div className="flex flex-col gap-3">
        <label htmlFor="url" className="text-sm font-medium">
          Website URL
        </label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || isLoading || !url.trim()}
            className="w-32"
          >
            {loading ? "Scanning..." : "Scan Events"}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Paste a full URL (e.g., https://example.com) to scan for Google Analytics
          events
        </p>
      </div>
    </form>
  );
};

export default EventCrawlerForm;
