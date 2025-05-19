'use client';
import React, { useEffect, useState } from 'react';
import styles from '../page.module.css';
import Link from 'next/link';
import { fetchPostByHexPostId } from '../fetchpost';
import { Login } from '@/components/login';

import { useAuthenticatedUser } from "@lens-protocol/react";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";

type Prediction = {
  id: string;
  postId:string;
  predictionId: string;
  questionText: string;
  sender: string;
  stake: string;
  minChallengeStake: string;
  challengeDeadline: string;
  postContent:string;
  author:string;
  resolution:string;
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function weiToEth(wei: string): string {
  return (Number(wei) / 1e18).toFixed(4);
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  return `${days} day ${hours} hours`;
}
function intToHex(postId:string) {
    try {
      const hex = '0x' + BigInt(postId).toString(16);
      return hex;
    } catch (e) {
      console.error('Invalid postId:', postId, e);
      return null;
    }
  }

const ListPage = ({ walletaddr }: { walletaddr: string }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_GRAPH_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GRAPH_API_KEY}`,
          },
          body: JSON.stringify({
            query: `
              {
                predictionCreateds(
                    first: 100,
                    orderBy: timestamp,
                    orderDirection: desc,
                    where: { sender: "${walletaddr.toLowerCase()}" }
                ) {
                  id
                  postId
                  predictionId
                  sender
                  stake
                  minChallengeStake
                  questionText
                  challengeDeadline
                  resolution

                }
              }
            `,
          }),
        });

        //fetchPostByHexPostId("0x5a811ef040705a3e0c945423f58817459a473d0b38e929b2046bd9993dd4f8a3");

        const json = await res.json();
        if (json.data && json.data.predictionCreateds) {
        //   setPredictions(json.data.predictionCreateds);
            const rawPredictions = json?.data?.predictionCreateds || [];

            // const enrichedPredictions = await Promise.all(
            // rawPredictions.map(async (pred: Prediction) => {
            //     const post = await fetchPostByHexPostId(intToHex(pred.postId)!);
            //     return {
            //     ...pred,
            //     postContent: post?.metadata?.content || null,
            //     author:post?.author?.username?.localName || null,
            //     };
            // })
            // );
            const enrichedPredictions = await Promise.all(
                rawPredictions.map(async (pred: Prediction) => {
                  const post = await fetchPostByHexPostId(intToHex(pred.postId)!);
              
                  // Check if 'metadata' exists on post
                  const postContent = post && 'metadata' in post && "content" in post.metadata
                    ? post.metadata.content
                    : null;
              
                  return {
                    ...pred,
                    postContent,
                    author: post?.author?.username?.localName || null,
                  };
                })
              );
              
    
            setPredictions(enrichedPredictions);
        } else {
          console.error('Unexpected response:', json);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    fetchPredictions();
  }, []);

  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();

  if(!authenticatedUser){
  return (
    <div
      style={{
        textAlign: "center",
        margin: "4rem auto",
        padding: "2rem",
        maxWidth: "400px",
        backgroundColor: "white", // soft yellow
        border: "2px solid black",
        borderRadius: "5px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "black" }}>
        Please Login and Refresh Page
      </p>
      <Login />
    </div>
  );
}
  return (
    <div className={styles.outer_container}>
     <h2 className="text-2xl font-semibold mb-6 mt-10 text-center text-gray-800 tracking-tight">
        Predictions By: <span className="text-blue-600 break-all">{walletaddr}</span>
        </h2>
   
        <div className={styles.container}>

        {predictions.length === 0 && (
        <div className={styles.emptyState}>
            <p>No predictions found for this address.</p>
        </div>
        )}
        {predictions.map((pred) => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = Math.max(0, Number(pred.challengeDeadline) - now);
            let statusText = "";
            let bgColor = "white"; // default background
            if (parseInt(pred.resolution) === 1) {
                statusText = "Prediction Accurate";
                bgColor = "rgb(234, 248, 234)";
            
            } else if (parseInt(pred.resolution) === 2) {
                statusText = "Prediction Inaccurate";
                bgColor = "rgb(250, 241, 241)";
            } else if (parseInt(pred.resolution) === 3) {
                statusText = "Prediction Invalidated";
                bgColor = "rgb(255, 240, 220)";
            } else if (parseInt(pred.resolution) === 0 && remaining === 0) {
                statusText = "Pending Resolution";
            }


            return (
            <div className={styles.card} key={pred.id}  style={{ backgroundColor: bgColor }}>
                <div className={styles.header}>
                {statusText ? (
                    <span className={styles.resolutionStatus}><strong>Ended</strong></span>
                    ) : (
                    <span><strong>Challenge Ends:</strong> <br></br>{formatDuration(remaining)}</span>
                    )}
                <span><strong>{weiToEth(pred.stake)} GHO</strong> <br></br> Staked</span>
                </div>
                <div className={styles.body}>
                <h2 className={styles.title}>{pred.questionText}</h2>
                <div className={styles.description_container}>
                    <p className={styles.description}>
                        {pred.postContent}
                    </p>
                <div  className={styles.username_div}>  <span className={styles.username}>@{pred.author}</span></div>
                </div>
                <Link
                    href={`/challenge/${pred.predictionId}`}
            
                    >
                    
                    {statusText?(<button className={styles.challengeButton}>{statusText}</button>):
                    (<button className={styles.challengeButton}>Challenge</button>)}
                </Link>
                <p className={styles.footer}>
                Min Stake: {weiToEth(pred.minChallengeStake)} GHO <br />
                    Prophet By: {shortenAddress(pred.sender)}
                
                    {/* <br/> {intToHex(pred.postId)} */}
                </p>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};

export default ListPage;