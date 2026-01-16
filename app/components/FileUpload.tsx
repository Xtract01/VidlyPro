"use client";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError,
} from "@imagekit/next";
import { useRef, useState } from "react";

export default function UploadExample() {
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAuthParams = async () => {
    const res = await fetch("/api/imagekit-auth");
    if (!res.ok) throw new Error("Failed to authenticate");
    return res.json();
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      alert("Select a file first");
      return;
    }

    const file = fileInputRef.current.files[0];
    abortControllerRef.current = new AbortController();

    const { signature, token, expire, publicKey } = await getAuthParams();

    try {
      const result = await upload({
        file,
        fileName: file.name,
        signature,
        token,
        expire,
        publicKey,
        abortSignal: abortControllerRef.current.signal,
        onProgress: (e) => {
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      console.log("Upload success:", result);
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted");
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} />
      <button onClick={handleUpload}>Upload</button>
      <br />
      <progress value={progress} max={100} />
    </div>
  );
}
