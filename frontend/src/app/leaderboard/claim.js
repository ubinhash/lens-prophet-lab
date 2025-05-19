'use client';
import { useEffect, useState } from 'react';

import { useWalletClient } from 'wagmi';
import predictionABI from '../../abi/prediction-abi.js';
import { useContractRead } from 'wagmi'
import { useAccount } from "wagmi";
import { Ballet } from 'next/font/google';
import styles from './claim.module.css'
function weiToEth(wei) {
  return parseFloat((Number(wei) / 1e18).toFixed(4));
}

const ClaimComponent = () => {
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();

  const claimBalance= async () => {
    try {
      if (!walletClient) return;

      const hash = await walletClient.writeContract({
        address: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT,
        abi: predictionABI,
        functionName: 'claim',
        args: [],
        value: BigInt(0),
      });

      console.log('Transaction hash:', hash);
    } catch (err) {
      console.error('Stake failed:', err.message || err);
    }
  };

  const { data, isLoading, error } = useContractRead ({
    address: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT,
    abi: predictionABI,
    functionName: 'balances',
    args: [address],
  });

  useEffect(() => {
    if (error) console.error('Contract read error:', error);
  }, [error]);

  function shortenAddress(addr, chars = 4) {
    if (!addr) return '';
    return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
  }
  return (
        <div className={styles.container}>
        <div>Claim Your Winning</div>
        <div className={styles.address}>{shortenAddress(address)}</div>
        <div className={styles.balance}>{weiToEth(data)} GHO</div>
        <button className={styles.button} onClick={claimBalance}>
            Claim
        </button>
        </div>

  );
};

export default ClaimComponent;
