"use client";
import React, { useEffect, useState } from "react";
import { textOnly } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";

import { storageClient } from "./storage-client";
import { useWalletClient } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { env } from "process";
const PostCreator = () => {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [sessionClient, setSessionClient] = useState<any>(null);

  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const init = async () => {
      try {
        const rawClient = await getLensClient();
        if (!rawClient.isSessionClient()) {
          throw new Error("Not authenticated — expected a SessionClient.");
        }
        setSessionClient(rawClient);
      } catch (err) {
        console.error("Failed to initialize Lens client:", err);
        setError("Lens client init failed");
      }
    };

    init();
  }, []);

  const handlePost = async () => {
    if (!sessionClient || !walletClient) {
      setError("Wallet or session not ready");
      return;
    }

    setPosting(true);
    setStatus("idle");
    setError(null);
    const feed_address= process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ? process.env.NEXT_PUBLIC_TESTNET_FEED_ADDRESS : process.env.NEXT_PUBLIC_MAINNET_FEED_ADDRESS

    try {
      const metadata = textOnly({ content });
      const { uri: contentUri } = await storageClient.uploadAsJson(metadata);

      console.log("uri",contentUri);
      console.log(feed_address)
      const result = await post(sessionClient, {
        contentUri: uri(contentUri),
        feed: evmAddress(feed_address), 
      }).andThen(handleOperationWith(walletClient));
      console.log(result)

      setStatus("success");
      setContent("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err.message || "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto">
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={4}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={posting}
      />
   
      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handlePost}
        disabled={posting || !content.trim()}
      >
        {posting ? "Posting..." : "Post"}
      </button>
      {status === "success" && (
        <p className="text-green-600 mt-2">Post created successfully!</p>
      )}
      {status === "error" && error && (
        <p className="text-red-600 mt-2">Error: {error}</p>
      )}
    </div>
  );
};

export default PostCreator;