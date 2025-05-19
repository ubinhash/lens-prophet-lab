'use client'
import React, { useEffect, useState } from 'react';

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Top Prophet Leaderboard</h1>
      <table className="min-w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border-b">Rank</th>
            <th className="p-2 border-b">Address</th>
            <th className="p-2 border-b">Score</th>
            <th className="p-2 border-b">Correct</th>
            <th className="p-2 border-b">Incorrect</th>
            <th className="p-2 border-b">Invalidated</th>
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
              <td className="p-2 border-b">view</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
