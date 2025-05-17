'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  text: string;
  user: string;
};

type TriageResults = {
  id: string;
  labels: string[];
  summary: string;
  recommended_action: string;
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
  triage_results?: TriageResults;
};

function MediaDisplay({ url, type }: { url: string | null, type: 'image' | 'voice' }) {
  if (!url) return null;

  if (type === 'image') {
    return (
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-1">Attached Image:</div>
        <img
          src={url}
          alt="Case attachment"
          className="max-w-full max-h-80 object-contain rounded-lg border border-gray-200"
        />
      </div>
    );
  }

  if (type === 'voice') {
    return (
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-1">Voice Recording:</div>
        <audio controls className="w-full" src={url}>
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return null;
}

function CaseDetailsContent() {
  const searchParams = useSearchParams();
  const caseid = searchParams.get('caseid');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const getImageAsDataURL = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  const exportToPDF = async () => {
    if (!caseData) return;
  
    setExporting(true);
    
    const jsPDF = (await import('jspdf')).default;
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 7;
      
      const addWrappedText = (
        text: string,
        y: number,
        fontSize: number = 12,
        isBold: boolean = false
      ): number => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, y);
        return y + (lineHeight * textLines.length);
      };
      
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 297, 'F');
      yPosition = addWrappedText('SnapAid Case Report', yPosition, 20, true);
      yPosition += 2;
      
      doc.setTextColor(100, 100, 100);
      yPosition = addWrappedText(`Generated on ${new Date().toLocaleString()}`, yPosition, 10);
      yPosition += 5;
      doc.setTextColor(0, 0, 0);
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(249, 249, 249);
      doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 40, 3, 3, 'FD');
      
      yPosition = addWrappedText('Case Information', yPosition, 16, true);
      yPosition += 2;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin - 5, yPosition, margin + contentWidth + 5, yPosition);
      yPosition += 5;
      
      yPosition = addWrappedText(`Case ID: ${caseData.id}`, yPosition, 12);
      yPosition = addWrappedText(`Status: ${caseData.status}`, yPosition, 12);
      yPosition = addWrappedText(`Created: ${new Date(caseData.created_at).toLocaleString()}`, yPosition, 12);
      yPosition = addWrappedText(`Last Updated: ${new Date(caseData.updated_at).toLocaleString()}`, yPosition, 12);
      yPosition += 10;
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 60, 3, 3, 'FD');
      
      yPosition = addWrappedText('Patient Input', yPosition, 16, true);
      yPosition += 2;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin - 5, yPosition, margin + contentWidth + 5, yPosition);
      yPosition += 5;
      
      yPosition = addWrappedText(caseData.input_text, yPosition, 12);
      
      if (caseData.input_image) {
        try {
          const imgData = await getImageAsDataURL(caseData.input_image);
          if (yPosition > 220) {
            doc.addPage();
            yPosition = margin;
          } else {
            yPosition += 10;
          }
          
          yPosition = addWrappedText('Attached Image:', yPosition, 12, true);
          yPosition += 5;
          
          const img = new Image();
          img.src = imgData;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const imgWidth = Math.min(contentWidth, 100);
          const ratio = img.height / img.width;
          const imgHeight = imgWidth * ratio;
          
          doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Failed to add image to PDF:', error);
        }
      }
      
      if (caseData.triage_results) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(243, 243, 243);
        doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 70, 3, 3, 'FD');
        
        yPosition = addWrappedText('Triage Assessment', yPosition, 16, true);
        yPosition += 2;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin - 5, yPosition, margin + contentWidth + 5, yPosition);
        yPosition += 5;
        
        yPosition = addWrappedText('Labels:', yPosition, 12, true);
        yPosition += 1;
        yPosition = addWrappedText(caseData.triage_results.labels.join(', '), yPosition, 11);
        yPosition += 3;
        
        yPosition = addWrappedText('Summary:', yPosition, 12, true);
        yPosition += 1;
        yPosition = addWrappedText(caseData.triage_results.summary, yPosition, 11);
        yPosition += 3;
        
        yPosition = addWrappedText('Recommended Action:', yPosition, 12, true);
        yPosition += 1;
        yPosition = addWrappedText(caseData.triage_results.recommended_action, yPosition, 11);
        yPosition += 10;
      }
      
      if (yPosition > 180) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 80, 3, 3, 'FD');
      
      yPosition = addWrappedText('Conversation History', yPosition, 16, true);
      yPosition += 2;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin - 5, yPosition, margin + contentWidth + 5, yPosition);
      yPosition += 5;
      
      if (caseData.conversation_history && caseData.conversation_history.length > 0) {
        for (const msg of caseData.conversation_history) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }

          if (msg.user === 'bot') {
            doc.setFillColor(238, 238, 238);
          } else {
            doc.setFillColor(245, 245, 245);
          }
          
          doc.roundedRect(margin, yPosition - 3, contentWidth - 10, 20, 2, 2, 'F');
          yPosition = addWrappedText(msg.user === 'bot' ? '🤖 Bot' : '👤 User', yPosition, 11, true);
          yPosition += 1;
          yPosition = addWrappedText(msg.text, yPosition, 11);
          yPosition += 7;
        }
      } else {
        yPosition = addWrappedText('No conversation history available.', yPosition, 11, true);
      }
      
      doc.save(`SnapAid_Case_${caseData.id}.pdf`);
      console.log('PDF generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading case...</div>;
  if (!caseData) return <div className="p-6 text-red-600">Case not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Case #{caseData.id}</h1>
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export to PDF</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Created at: {new Date(caseData.created_at).toLocaleString()} • Status:{' '}
        <span className="font-medium">{caseData.status}</span>
      </p>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-800">
          Initial Input
        </div>
        <div className="p-4 text-gray-700 whitespace-pre-wrap">{caseData.input_text}</div>

        <div className="px-4 pb-4">
          <MediaDisplay url={caseData.input_image} type="image" />
          <MediaDisplay url={caseData.input_voice} type="voice" />
        </div>
      </div>

      {caseData.triage_results && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 font-semibold text-gray-800">
            Triage Assessment
          </div>
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Labels:</div>
              <div className="flex flex-wrap gap-2">
                {caseData.triage_results.labels.map((label, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Summary:</div>
              <p className="text-gray-700">{caseData.triage_results.summary}</p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Recommended Action:</div>
              <p className="text-gray-700">{caseData.triage_results.recommended_action}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Conversation</h2>
      <div className="space-y-4">
        {caseData.conversation_history && caseData.conversation_history.length > 0 ? (
          caseData.conversation_history.map((msg, idx) => (
            <div key={idx} className="flex flex-col border border-gray-100 rounded-md p-4 bg-gray-50">
              <span className="text-sm font-semibold text-gray-800 mb-1">
                {msg.user === 'bot' ? '🤖 Bot' : `👤 ${msg.user}`}
              </span>
              <p className="text-gray-700">{msg.text}</p>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">No conversation history yet.</div>
        )}
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