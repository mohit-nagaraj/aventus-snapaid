"use client";
import { Case } from '@/types/globals';
import { useEffect, useState } from 'react';

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch('/api/cases');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch cases');
        setCases(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  if (loading) return <div>Loading cases...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">User ID</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Updated At</th>
            <th className="border px-4 py-2">Input Text</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td className="border px-4 py-2 text-sm font-mono">{c.id}</td>
              <td className="border px-4 py-2">{c.user_id}</td>
              <td className="border px-4 py-2">{c.status}</td>
              <td className="border px-4 py-2">{new Date(c.created_at).toLocaleString()}</td>
              <td className="border px-4 py-2">{new Date(c.updated_at).toLocaleString()}</td>
              <td className="border px-4 py-2">{c.input_text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
