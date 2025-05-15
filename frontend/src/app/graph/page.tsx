'use client';

import { useEffect, useState } from 'react';

type Question = {
  id: string;
  sender: string;
  postId: string;
  question: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('https://api.studio.thegraph.com/query/111655/lens-prophet-lab/version/latest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY', // replace with your actual key
          },
          body: JSON.stringify({
            query: `
              {
                questionCreateds(first: 5) {
                  id
                  sender
                  postId
                  question
                }
              }
            `,
            operationName: 'Subgraphs',
            variables: {}
          }),
        });

        const json = await res.json();
        if (json.data) {
          setQuestions(json.data.questionCreateds);
        } else {
          setError('Failed to fetch questions.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Questions</h1>
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="border rounded p-4 bg-white shadow">
            <p><strong>Question:</strong> {q.question}</p>
            <p><strong>Sender:</strong> {q.sender}</p>
            <p><strong>Post ID:</strong> {q.postId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
