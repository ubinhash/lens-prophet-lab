'use client'
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import ClaimComponent from './claim.js'
export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_GRAPH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GRAPH_API_KEY}`,
          },
          body: JSON.stringify({
            query: `
              {
                scores(first: 10, orderBy: score, orderDirection: desc) {
                  id
                  total_prediction
                  prediction_correct
                  prediction_incorrect
                  prediction_invalidated
                  score
                }
              }
            `,
          }),
        });

        const json = await res.json();
        setScores(json?.data?.scores || []);
      } catch (err) {
        console.error('Failed to fetch scores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <p className="p-4">Loading leaderboard...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Top Prophet Leaderboard</h1>
  
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Side - Table */}
      <div className="w-full lg:w-[70%] overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border-b">Rank</th>
              <th className="p-2 border-b">Address</th>
              <th className="p-2 border-b">Score</th>
              <th className="p-2 border-b">✔️</th>
              <th className="p-2 border-b">✖️</th>
              <th className="p-2 border-b">Invalid</th>
              <th className="p-2 border-b">Total Predictions</th>
              <th className="p-2 border-b">Profile</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={score.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{index + 1}</td>
                <td className="p-2 border-b font-mono text-sm truncate w-[150px]">{score.id}</td>
                <td className="p-2 border-b">{parseFloat(score.score).toFixed(2)}</td>
                <td className="p-2 border-b">{score.prediction_correct}</td>
                <td className="p-2 border-b">{score.prediction_incorrect}</td>
                <td className="p-2 border-b">{score.prediction_invalidated}</td>
                <td className="p-2 border-b">{score.total_prediction}</td>
                <td className="p-2 border-b">
                  <Link href={`/discover/${score.id}`} className="text-blue-600 hover:underline">
                    view
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Right Side - Explanation + Claim */}
      <div className="w-full lg:w-[30%] flex flex-col gap-4">
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">How is Score Calculated?</h2>
          <p className="text-sm text-gray-700">
            Score is calculated based on a number of factors like your confidence level, stake amount, and prediction
            accuracy and we can have custom weighting algorithm for different templates in the future.<br></br> If the minimum stake is small, it implies you are willing to take odds are against you — you will be rewarded if your prediction turned out to be true, and vice versa.
          </p>
        </div>
  
        <div className="bg-white p-4 rounded shadow">
          <ClaimComponent />
        </div>
      </div>
    </div>
  </div>
  
  );
}
