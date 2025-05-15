"use client";

import React, { useEffect, useState } from "react";
import { fetchPosts,fetchPost } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { useAccount } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { txHash } from "@lens-protocol/client";
import { postId, PostReferenceType } from "@lens-protocol/client";
const MyPosts = () => {
  const { address } = useAccount();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [authenticatedAddress, setAuthenticatedAddress] = useState(null);

  async function getAuthenticatedAccount() {
    const client = await getLensClient();
  
    if (!client.isSessionClient()) {
      return null;
    }
  
    const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
    if (!authenticatedUser) {
      return null;
    }
  
    return fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
  }
  

  useEffect(() => {
    const fetchAuthenticatedAccount = async () => {
      try {
        const account = await getAuthenticatedAccount();
        if (account) {
          setAuthenticatedAddress(account.address);
        } else {
          setError("No authenticated user found.");
        }
      } catch (err) {
        console.error("Failed to fetch authenticated account:", err);
        setError("Error fetching authenticated account.");
      }
    };

    fetchAuthenticatedAccount();
  }, []);


  useEffect(() => {
    if (!authenticatedAddress) return;

    const fetch = async () => {
      try {
        setLoading(true);
        const feed_address= process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ? process.env.NEXT_PUBLIC_TESTNET_FEED_ADDRESS : process.env.NEXT_PUBLIC_MAINNET_FEED_ADDRESS
        
        const client = await getLensClient();
        const result = await fetchPosts(client, {
          filter: {
            authors: evmAddress(authenticatedAddress),
            feeds: [
              {
                feed: evmAddress(feed_address),
              },
            ],
            
          },
        });
        // const result = await fetchPost(client, {
        //   txHash: txHash("0x75836250c8881dbedce18054e30e1a4071448312c670e29e44c0294ce3c575ae"),
        // });
        
        console.log(result)

        if (result.isErr()) {
          throw new Error(result.error.message);
        }

        // setPosts([result.value]);
        setPosts(result.value.items);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err.message || "Error fetching posts");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [authenticatedAddress]);

  if (!address) return <p className="text-gray-600">Connect wallet to view your posts.</p>;
  if (loading) return <p className="text-blue-600">Loading your posts...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (posts.length === 0) return <p className="text-gray-500">     Your address {address} You haven't posted anything yet.</p>;

  return (
    <div className="space-y-4 max-w-xl mx-auto mt-4">
 
      {posts.map((post) => (
        <div key={post.id} className="border rounded p-4 shadow">
          {/* <p className="text-sm text-gray-400">{new Date(post.timestamp).toLocaleString()}</p> */}
          <p className="text-lg">{post.metadata?.content || "No content"}</p>
       
        </div>
      ))}
    </div>
  );
};

export default MyPosts;
