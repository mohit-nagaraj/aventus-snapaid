'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  text: string;
  user: string;
};

type CaseData = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  input_text: string;
  input_image: string | null;
  input_voice: string | null;
  conversation_history: Message[];
};

function CaseDetailsContent() {
  const searchParams = useSearchParams();
  const caseid = searchParams.get('caseid');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseid) {
      console.log("not found");
      return;
    }
    fetch(`/api/case?caseid=${caseid}`)
      .then(res => res.json())
      .then(data => setCaseData(data.data))
      .catch(err => console.error('Failed to fetch case:', err))
      .finally(() => setLoading(false));
  }, [caseid]);

  if (loading) return <div className="p-6 text-gray-600">Loading case...</div>;
  if (!caseData) return <div className="p-6 text-red-600">Case not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Case #{caseData.id}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Created at: {new Date(caseData.created_at).toLocaleString()} • Status:{' '}
        <span className="font-medium">{caseData.status}</span>
      </p>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-800">
          Initial Input
        </div>
        <div className="p-4 text-gray-700 whitespace-pre-wrap">{caseData.input_text}</div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Conversation</h2>
      <div className="space-y-4">
        {caseData.conversation_history.map((msg, idx) => (
          <div key={idx} className="flex flex-col border border-gray-100 rounded-md p-4 bg-gray-50">
            <span className="text-sm font-semibold text-gray-800 mb-1">
              {msg.user === 'bot' ? '🤖 Bot' : `👤 ${msg.user}`}
            </span>
            <p className="text-gray-700">{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CaseDetailsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading case...</div>}>
      <CaseDetailsContent />
    </Suspense>
  );
}