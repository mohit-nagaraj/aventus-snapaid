'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreateCasePage() {
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputVoice, setInputVoice] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {userId} = useAuth()

  const handleSubmit = async () => {
    if (!inputText.trim()) return alert('Text input is required.');

    setSubmitting(true);

    const input_image = inputImage ? await toBase64(inputImage) : null;
    const input_voice = inputVoice ? await toBase64(inputVoice) : null;

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          input_text: inputText,
          input_image,
          input_voice,
        }),
      });

      const result = await res.json();
      console.log('Response:', result);
      if (res.ok) {
        toast.success('Case submitted successfully!');
        setInputText('');
        setInputImage(null);
        setInputVoice(null);
      } else {
        toast.error('Error: ' + (result.error || 'Failed to submit case'));
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-6 space-y-6">
        <textarea
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-40 p-4 text-lg border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
            📷 Add Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setInputImage(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          {inputImage && (
            <span className="text-sm text-gray-600">Image selected: {inputImage.name}</span>
          )}

          <label className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
            🎤 Add Voice
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setInputVoice(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          {inputVoice && (
            <span className="text-sm text-gray-600">Voice file: {inputVoice.name}</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 text-lg font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
