"use client";
import React, { useEffect, useState } from "react";
import { textOnly } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";

import { storageClient } from "./storage-client";
import { useAccount,useWalletClient } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { env } from "process";

const PostCreator = () => {
  // const { address } = useAccount();
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
      if(!feed_address){
        throw("feed address is null");
      }
      const result = await post(sessionClient, {
        contentUri: uri(contentUri),
        feed: evmAddress(feed_address), 
      }).andThen(handleOperationWith(walletClient));
      
      
      const txHash = result.value as string;
      console.log(result)
      addQuestion(txHash);
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

  const addQuestion = async (postTx: string) => {
    try{
      if(!walletClient){
        return;
      }
      const contractAbi=[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"bytes32","name":"postId","type":"bytes32"},{"indexed":false,"internalType":"string","name":"question","type":"string"},{"indexed":false,"internalType":"uint256","name":"amountSent","type":"uint256"}],"name":"QuestionCreated","type":"event"},{"inputs":[{"internalType":"bytes32","name":"postId","type":"bytes32"},{"internalType":"string","name":"question","type":"string"}],"name":"createQuestion","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"questions","outputs":[{"internalType":"bytes32","name":"postId","type":"bytes32"},{"internalType":"string","name":"question","type":"string"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"amountSent","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]
      const hash = await walletClient.writeContract({
        address: "0x48d5C7801658b29e413F343B5998c733662b24c4",
        abi: contractAbi,
        functionName: "createQuestion",
        args: [postTx, "What is Lens Protocol?"],
        value: BigInt(0.0001 * 1e18), // example for sending 0.01 ETH
      });
    }
    catch (err: any) {
      console.log(err);
    }
  }

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

      {/* <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={addQuestion}
      >
        ADD QUESTION
      </button> */}

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