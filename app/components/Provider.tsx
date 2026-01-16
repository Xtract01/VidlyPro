"use client";

import { ImageKitProvider } from "@imagekit/next";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
    >
      {children}
    </ImageKitProvider>
  );
}
