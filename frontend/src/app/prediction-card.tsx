'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
interface Prediction {
  id: string;
  postId: string;
  predictionId: string;
  sender: string;
  stake: string;
  minChallengeStake: string;
  questionText: string;
  challengeDeadline: string;
  resolution: string;
  postContent?: string;
  author?: string;
}
function weiToEth(wei: string): number {
  return parseFloat((Number(wei) / 1e18).toFixed(4));
}

const PredictionCard: React.FC = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    const fetchLatestPrediction = async () => {
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
                predictionCreateds(first: 1, orderBy: timestamp, orderDirection: desc) {
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

        const json = await res.json();
        const rawPrediction = json?.data?.predictionCreateds?.[0];

        if (!rawPrediction) return;

        // You can optionally enrich the post here if needed
        // const post = await fetchPostByHexPostId(intToHex(rawPrediction.postId));
        // const postContent = post?.metadata?.content || null;

        setPrediction({
          ...rawPrediction,
          postContent: null, // set actual post content if needed
          author: null, // set author if needed
        });
      } catch (err) {
        console.error('Failed to fetch latest prediction:', err);
      }
    };

    fetchLatestPrediction();
  }, []);

  if (!prediction) {
    return <div className="p-4">Loading latest prediction...</div>;
  }

  return (
    <div className="w-full h-full bg-rose-200 rounded border-2 border-grey flex flex-col justify-between p-3">
      {/* Top Bar */}
      <div className="flex text-[14px] justify-between items-center font-semibold border-b border-black pb-1">
        <span>Latest Prediction</span>
        <span>{weiToEth(prediction.stake)} GHO Staked</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-2 overflow-hidden">
        <h2 className="text-lg font-bold mb-1 mt-2">{prediction.questionText}</h2>
        <div className="text-sm max-h-16 overflow-y-auto pr-1">
          {prediction.postContent || 'Click challenge to view detailed content.'}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <button className="bg-black text-white px-4 py-1 rounded font-bold">
          <Link href={`/challenge/${prediction.predictionId}`}>
             CHALLENGE
          </Link>
        </button>
        <span className="text-xs">
          Prophet By: {prediction.sender.slice(0, 6)}...{prediction.sender.slice(-4)}
        </span>
      </div>
    </div>
  );
};

export default PredictionCard;
