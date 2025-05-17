"use client";
import { Case } from '@/types/globals';
import { useEffect, useState, useMemo } from 'react';
import { Badge } from '../components/Badge';
import { CaseRow } from '../components/CaseRow';
import { Search } from 'lucide-react';

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Opened' | 'Closed'>('all');

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

  // Memoized filtered case list
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesStatus =
        selectedStatus === 'all' || c.status === selectedStatus;
      const matchesQuery = c.input_text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [cases, searchQuery, selectedStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-r-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <main className="container w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Cases</h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Search cases..."
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'Opened' | 'Closed')}
                  className="bg-white border border-gray-300 text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="all">All</option>
                  <option value="Opened">Opened</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                New case
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  {cases.filter((c) => c.status === 'Opened').length} Open
                </Badge>
                <Badge variant="neutral">
                  {cases.filter((c) => c.status === 'Closed').length} Closed
                </Badge>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredCases.length > 0 ? (
                filteredCases.map((caseItem) => (
                  <CaseRow key={caseItem.id} caseItem={caseItem} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No cases found
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
