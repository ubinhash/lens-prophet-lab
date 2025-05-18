'use client';
import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { fetchPostByHexPostId } from './fetchpost';
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
  return `${days} Days ${hours} Hour`;
}
function intToHex(postId) {
    try {
      const hex = '0x' + BigInt(postId).toString(16);
      return hex;
    } catch (e) {
      console.error('Invalid postId:', postId, e);
      return null;
    }
  }

const Predictions = () => {
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
                predictionCreateds(first: 5, orderBy: timestamp, orderDirection: desc) {
                  id
                  postId
                  predictionId
                  sender
                  stake
                  minChallengeStake
                  questionText
                  challengeDeadline

                }
              }
            `,
          }),
        });

        fetchPostByHexPostId("0x5a811ef040705a3e0c945423f58817459a473d0b38e929b2046bd9993dd4f8a3");

        const json = await res.json();
        if (json.data && json.data.predictionCreateds) {
        //   setPredictions(json.data.predictionCreateds);
            const rawPredictions = json?.data?.predictionCreateds || [];

            const enrichedPredictions = await Promise.all(
            rawPredictions.map(async (pred: Prediction) => {
                const post = await fetchPostByHexPostId(intToHex(pred.postId));
                return {
                ...pred,
                postContent: post?.metadata?.content || null,
                author:post?.author?.username?.localName || null,
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

  return (
    <div className={styles.container}>
      {predictions.map((pred) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, Number(pred.challengeDeadline) - now);

        return (
          <div className={styles.card} key={pred.id}>
            <div className={styles.header}>
              <span><strong>Challenge Ends:</strong> {formatDuration(remaining)}</span>
              <span><strong>{weiToEth(pred.stake)}</strong> ETH Staked</span>
            </div>
            <div className={styles.body}>
              <h2 className={styles.title}>{pred.questionText}</h2>
              <div className={styles.description_container}>
                <p className={styles.description}>
                    {pred.postContent}
                </p>
              <div  className={styles.username_div}>  <span className={styles.username}>@{pred.author}</span></div>
              </div>
              <button className={styles.challengeButton}>CHALLENGE</button>
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
  );
};

export default Predictions;