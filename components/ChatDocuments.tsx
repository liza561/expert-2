"use client";

import { useChatContext } from "stream-chat-react";
import React, { useEffect, useState } from "react";

export default function ChatDocuments({ onClose }: { onClose: () => void }) {
  const { channel } = useChatContext();
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      if (!channel) return;

      const state = channel.state;

      // all messages currently loaded in memory
      const loadedMessages = state.messages || [];

      const extracted: any[] = [];

      for (const msg of loadedMessages) {
        if (!msg.attachments) continue;

        msg.attachments.forEach((att: any) => {
          // IMAGE attachments
          if (att.type === "image" && (att.image_url || att.thumb_url)) {
            extracted.push({
              id: att.asset_id || att.image_url,
              type: "image",
              url: att.image_url || att.thumb_url,
              name: att.fallback || "Image",
            });
          }

          // FILE attachments
          if (att.type === "file" && att.asset_url) {
            extracted.push({
              id: att.asset_id || att.asset_url,
              type: "file",
              url: att.asset_url,
              name: att.title || att.fallback || "Document",
            });
          }
        });
      }

      setFiles(extracted);
    };

    loadFiles();
  }, [channel]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[500px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Chat Documents</h2>

        {files.length === 0 && (
          <p className="text-gray-500">No attachments found.</p>
        )}

        <div className="max-h-[300px] overflow-y-auto space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="border p-3 rounded-lg flex items-center gap-3"
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                  📄
                </div>
              )}

              <a
                href={file.url}
                target="_blank"
                className="text-blue-600 underline"
              >
                {file.name}
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
