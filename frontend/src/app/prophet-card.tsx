"use client";

import React, { useEffect, useState } from "react";

// const topProphets = [
//     { address: "0x1234...abcd", correct: 12, total: 15, score: 0.8 },
//     { address: "0x5678...efgh", correct: 9, total: 12, score: 0.75 },
//     // Add more up to 10...
//   ];
  
  export function TopProphetCard() {

    type TopProphet = {
        address: string;
        correct: number;
        total: number;
        score: number;
      };

    const [topProphets,setTopProphets]=useState<TopProphet[]>([]);
    useEffect(() => {
        const fetchScores = async () => {
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
            const parsed = (json?.data?.scores || []).map((s: any) => ({
              address: `${s.id.slice(0, 6)}...${s.id.slice(-4)}`,
              correct: s.prediction_correct,
              total: s.total_prediction,
              score: parseFloat(s.score),
            }));
      
            setTopProphets(parsed);
          } catch (err) {
            console.error('Failed to fetch scores:', err);
          } finally {
  
          }
        };
      
        fetchScores();
      }, []);

      
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f6fdf3", // softer green-tinted background
        }}
      >
        <div
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            marginBottom: "5px",
            paddingBottom: "10px",
            textAlign: "center",
            borderBottom: "1px solid #ccc",
            paddingTop: "10px",
            color: "#1f2937", // darker gray for better contrast
          }}
        >
          Top Prophets
        </div>
  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr 1fr 1fr",
            fontWeight: "bold",
            borderBottom: "1px solid #ccc",
            paddingBottom: "8px",
            marginBottom: "0px",
            paddingLeft: "10px",
            paddingRight: "10px",
            color: "#4b5563", // subtle dark gray
          }}
        >
          <span>Address</span>
          <span>✅</span>
          <span>Total</span>
          <span>Score</span>
        </div>
  
        {topProphets.map((prophet, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr 1fr 1fr",
              padding: "6px 0",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "0.95rem",
              color: "#374151",
              backgroundColor: index % 2 === 0 ? "#f6fdf3" : "#ffffff",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <span style={{ fontFamily: "monospace" }}>{prophet.address}</span>
            <span>{prophet.correct}</span>
            <span>{prophet.total}</span>
            <span>{parseFloat((prophet.score ).toFixed(2))}</span>
          </div>
        ))}
      </div>
    );
  }
  