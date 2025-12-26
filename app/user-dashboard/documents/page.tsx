"use client";

import { useChatContext } from "stream-chat-react";
import { useEffect, useState } from "react";

type DocItem = {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  channelId: string;
};

export default function YourDocumentsPage() {
  const { client } = useChatContext();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const loadAllDocuments = async () => {
      setLoading(true);

      // 1 All channels user belongs to
      const channels = await client.queryChannels({
        type: "messaging",
        members: { $in: [client.userID!] },
      });

      const map = new Map<string, DocItem>();

      // 2 Load messages per channel
      for (const channel of channels) {
        const res = await channel.query({
          messages: { limit: 100 },
        });

        res.messages?.forEach((msg: any) => {
          msg.attachments?.forEach((att: any) => {
            if (att.type === "image" && (att.image_url || att.thumb_url)) {
              map.set(att.asset_id || att.image_url, {
                id: att.asset_id || att.image_url,
                type: "image",
                url: att.image_url || att.thumb_url,
                name: att.fallback || "Image",
                channelId: channel.cid,
              });
            }

            if (att.type === "file" && att.asset_url) {
              map.set(att.asset_id || att.asset_url, {
                id: att.asset_id || att.asset_url,
                type: "file",
                url: att.asset_url,
                name: att.title || att.fallback || "Document",
                channelId: channel.cid,
              });
            }
          });
        });
      }

      setDocs(Array.from(map.values()));
      setLoading(false);
    };

    loadAllDocuments();
  }, [client]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Documents</h1>

      {loading && <p>Loading…</p>}

      {!loading && docs.length === 0 && (
        <p className="text-muted-foreground">No documents found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            className="border rounded-lg p-3 hover:bg-muted"
          >
            {doc.type === "image" ? (
              <img
                src={doc.url}
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              <div className="h-40 flex items-center justify-center">
                📄 {doc.name}
              </div>
            )}

            <p className="text-xs mt-2 text-muted-foreground">
              Chat: {doc.channelId}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
