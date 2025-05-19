'use client';
import { type FC, useEffect, useState } from 'react';
import styles from './page.module.css';
import { fetchPostByHexPostId } from '../../discover/fetchpost';
import { useWalletClient } from 'wagmi';
import predictionABI from '../../../abi/prediction-abi.js';

// type Props = {
//   params: {
//     predictionId: string;
//   };
// };

type Prediction = {
  id: string;
  postId: string;
  predictionId: string;
  sender: string;
  stake: string;
  minChallengeStake: string;
  maxChallengeStake: string;
  questionText: string;
  challengeDeadline: string;
  resolution: string;
  postContent?: string | null;
  author?: string | null;
  currentStake: string;
  challengers: string[];
};

function intToHex(postId: string) {
  try {
    return '0x' + BigInt(postId).toString(16);
  } catch (e) {
    console.error('Invalid postId:', postId, e);
    return null;
  }
}

function weiToEth(wei: string): number {
  return parseFloat((Number(wei) / 1e18).toFixed(4));
}

const ChallengePage = ({ predictionId }: { predictionId: string }) => {
 

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const { data: walletClient } = useWalletClient();
  const [newStake, setNewStake] = useState(0.001);
  const [stakeError, setStakeError] = useState('');

  useEffect(() => {
    const fetchPredictionById = async () => {
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
                predictionCreateds(where: { predictionId: "${predictionId}" }) {
                  id
                  postId
                  predictionId
                  sender
                  stake
                  minChallengeStake
                  maxChallengeStake
                  questionText
                  challengeDeadline
                  currentStake
                  challengers
                  resolution
                }
              }
            `,
          }),
        });

        const json = await res.json();
        const prediction = json?.data?.predictionCreateds?.[0];

        if (prediction) {
          const post = await fetchPostByHexPostId(intToHex(prediction.postId)!);
          if (post && 'metadata' in post &&'content' in post.metadata ) {
            setPrediction({
              ...prediction,
              postContent: post?.metadata?.content || null,
              author: post?.author?.username?.localName || null,
            });
          }
        } else {
          console.warn('Prediction not found');
        }
      } catch (error) {
        console.error('Error fetching prediction:', error);
      }
    };

    if (predictionId) {
      fetchPredictionById();
    }
  }, [predictionId]);

  useEffect(() => {
    if (prediction) {
      const minStake = Number(prediction.minChallengeStake) / 1e18;
      const maxAvailable = (Number(prediction.maxChallengeStake) - Number(prediction.currentStake)) / 1e18;

      if (parseInt(prediction.resolution) !== 0) {
        setNewStake(0);
      } else {
        setNewStake(Math.min(minStake, maxAvailable));
      }
    }
  }, [prediction]);

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const maxAvailable = (Number(prediction?.maxChallengeStake) - Number(prediction?.currentStake)) / 1e18;

    if (isNaN(value)) {
      setNewStake(0);
      setStakeError('Invalid input');
    } else if (value < 0.001) {
      setStakeError('Stake must be at least 0.001 GHO');
    } else if (value > maxAvailable) {
      setStakeError(`Stake must not exceed ${maxAvailable.toFixed(4)} GHO`);
    } else {
      setStakeError('');
      setNewStake(value);
    }
  };

  const addStake = async () => {
    try {
      if (!walletClient) return;

      const hash = await walletClient.writeContract({
        address: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT as `0x${string}`,
        abi: predictionABI,
        functionName: 'challengePrediction',
        args: [predictionId],
        value: BigInt(newStake * 1e18),
      });

      console.log('Transaction hash:', hash);
    } catch (err: any) {
      console.error('Stake failed:', err.message || err);
    }
  };

  const renderProgressBar = () => {
    if (!prediction) return null;

    const min = weiToEth(prediction.minChallengeStake);
    const current = weiToEth(prediction.currentStake);
    const max = weiToEth(prediction.maxChallengeStake);
    const newPercent = Math.min((newStake / max) * 100, 100 - (current / max) * 100);

    return (
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div className={styles.currentBar} style={{ width: `${(current / max) * 100}%` }} />
          <div className={styles.currentBar2} style={{ left: `${(current / max) * 100}%`, width: `${newPercent}%` }} />
          <div className={styles.minMarker} style={{ left: `${(min / max) * 100}%` }} />
          <div className={styles.minMarker2} style={{ left: `calc(${(min / max) * 100}% + 10px)` }}>
            {min} GHO (Min Total)
          </div>
        </div>
        <div className={styles.progressLabels}>
          <span>Total Challenged: <span className={styles.greenLabel}>{current} GHO</span></span>
          <div style={{ textAlign: 'right' }}>
            {max} GHO <br />(Max Total Challenge)
            <span className={styles.tooltipWrapper}>
              ?
              <span className={styles.tooltipText}>
                Everyone can stake GHO to challenge this prediction up to Max. <br />
                But if the challenge pool is less than this minimum during resolution, the challenge will abort.
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {prediction ? (
        <div className={styles.card}>
          <h2 className={styles.title}>{prediction.questionText}</h2>
          <p className={styles.postContent}>{prediction.postContent}</p>
          <p className={styles.author}>@{prediction.author}</p>

          {renderProgressBar()}

          {parseInt(prediction.resolution) === 0 &&
            parseInt(prediction.challengeDeadline) > Math.floor(Date.now() / 1000) && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0rem' }}>
                  <label>
                    Stake amount (GHO)
                    <input
                      type="number"
                      min="0.001"
                      step="0.0001"
                      value={newStake}
                      onChange={handleStakeChange}
                      className={styles.input}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '4px',
                        borderRadius: '4px',
                        textAlign: 'center',
                      }}
                    />
                  </label>
                  {stakeError && (
                    <p style={{ color: 'red', marginTop: '0.25rem' }}>{stakeError}</p>
                  )}
                </div>
                <button className={styles.button} onClick={addStake}>
                  Stake to Challenge
                </button>
              </div>
            )}

          {parseInt(prediction.resolution) === 1 && (
            <div className={`${styles.resolutionStatus} ${styles.correct}`}>Prediction Is Correct</div>
          )}
          {parseInt(prediction.resolution) === 2 && (
            <div className={`${styles.resolutionStatus} ${styles.incorrect}`}>Prediction Is Incorrect</div>
          )}
          {parseInt(prediction.resolution) === 3 && (
            <div className={`${styles.resolutionStatus} ${styles.invalidated}`}>Prediction Is Invalidated</div>
          )}
          {parseInt(prediction.resolution) === 0 &&
            parseInt(prediction.challengeDeadline) < Math.floor(Date.now() / 1000) && (
              <div className={`${styles.resolutionStatus} ${styles.invalidated}`}>Pending Resolution</div>
            )}
        </div>
      ) : (
        <p>Loading prediction...</p>
      )}
    </div>
  );
};

export default ChallengePage;
