import React, { useEffect, useState } from "react";
import { fetchPosts,fetchPost } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { useAccount } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { txHash } from "@lens-protocol/client";

export async function fetchPostByHexPostId(hexPostId: string) {
  try {
    const client = await getLensClient();

    const result = await fetchPost(client, {
      txHash: txHash(hexPostId),
    });
    console.log(result)

    if (result.isErr()) {
      console.error("Failed to fetch post:", result.error);
      return null;
    }

    return result.value;
  } catch (err) {
    console.error("Error in fetchPostByHexPostId:", err);
    return null;
  }
}
