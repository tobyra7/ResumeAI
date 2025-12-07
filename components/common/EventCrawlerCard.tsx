"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import React from "react";

const EventCrawlerCard = () => {
  return (
    <Link href="/event-crawler">
      <div className="group relative w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-700 hover:bg-primary-700/5 transition duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/0 via-transparent to-primary-700/0 group-hover:from-primary-700/5 group-hover:to-primary-700/10 transition duration-300" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
          <div className="rounded-full bg-primary-700/10 group-hover:bg-primary-700/20 p-4 transition duration-300">
            <Zap className="w-6 h-6 text-primary-700" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-sm">Event Crawler</p>
            <p className="text-xs text-gray-600 mt-1">Scan GA/GTM events</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCrawlerCard;
