// 'use client';

// import { useAuth } from '@clerk/nextjs';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { useRouter } from 'next/navigation';
// import FileUpload from '../components/FileUpload';

// export default function CreateCasePage() {
//   const [inputText, setInputText] = useState('');
//   const [inputImage, setInputImage] = useState<File | null>(null);
//   const [inputVoice, setInputVoice] = useState<File | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const router = useRouter();
//   const { userId } = useAuth();

//   const uploadFile = async (file: File, folder: string): Promise<string | null> => {
//     if (!file) return null;
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('folder', folder);
      
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         throw new Error(`Upload failed: ${response.statusText}`);
//       }
      
//       const result = await response.json();
//       return result.url;
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       toast.error('Failed to upload file');
//       return null;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!inputText.trim()) {
//       toast.error('Text input is required');
//       return;
//     }
    
//     if (!userId) {
//       toast.error('You must be logged in to create a case');
//       return;
//     }

//     setSubmitting(true);
//     setUploadProgress(10);
    
//     try {
//       let imageUrl = null;
//       if (inputImage) {
//         setUploadProgress(20);
//         imageUrl = await uploadFile(inputImage, 'images');
//         setUploadProgress(40);
//       }
      
//       let voiceUrl = null;
//       if (inputVoice) {
//         setUploadProgress(60);
//         voiceUrl = await uploadFile(inputVoice, 'audio');
//         setUploadProgress(80);
//       }
      
//       const res = await fetch('/api/cases', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           user_id: userId,
//           input_text: inputText,
//           input_image: imageUrl,
//           input_voice: voiceUrl,
//         }),
//       });

//       setUploadProgress(100);
      
//       const result = await res.json();
      
//       if (res.ok) {
//         toast.success('Case submitted successfully!');
//         setInputText('');
//         setInputImage(null);
//         setInputVoice(null);
        
//         if (result.data && result.data.id) {
//           router.push(`/case?caseid=${result.data.id}`);
//         } else {
//           router.push(`/profile?user=${userId}`);
//         }
//       } else {
//         toast.error('Error: ' + (result.error || 'Failed to submit case'));
//       }
//     } catch (err) {
//       console.error('Submission error:', err);
//       toast.error('Failed to submit case');
//     } finally {
//       setSubmitting(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-6 space-y-6">
//         <h1 className="text-2xl font-bold">Create New Case</h1>
        
//         <textarea
//           placeholder="Describe your issue here..."
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           className="w-full h-40 p-4 text-lg border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <div className="space-y-4">
//           <FileUpload
//             accept="image/*"
//             label="Add Image"
//             icon="📷"
//             onChange={setInputImage}
//             value={inputImage}
//           />
          
//           <FileUpload
//             accept="audio/*"
//             label="Add Voice"
//             icon="🎤"
//             onChange={setInputVoice}
//             value={inputVoice}
//           />
//         </div>

//         {uploadProgress > 0 && (
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div 
//               className="bg-blue-600 h-2.5 rounded-full" 
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//         )}

//         <button
//           onClick={handleSubmit}
//           disabled={submitting}
//           className="w-full py-3 text-lg font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
//         >
//           {submitting ? 'Submitting...' : 'Submit Case'}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client"

import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { FileUpload } from "../components/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, PlusCircle, ImagePlus, Mic } from "lucide-react"

export default function CreateCasePage() {
  const [inputText, setInputText] = useState("")
  const [inputImage, setInputImage] = useState<File | null>(null)
  const [inputVoice, setInputVoice] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const router = useRouter()
  const { userId } = useAuth()

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!file) return null

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
      return null
    }
  }

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast.error("Text input is required")
      return
    }

    if (!userId) {
      toast.error("You must be logged in to create a case")
      return
    }

    setSubmitting(true)
    setUploadProgress(10)

    try {
      let imageUrl = null
      if (inputImage) {
        setUploadProgress(20)
        imageUrl = await uploadFile(inputImage, "images")
        setUploadProgress(40)
      }

      let voiceUrl = null
      if (inputVoice) {
        setUploadProgress(60)
        voiceUrl = await uploadFile(inputVoice, "audio")
        setUploadProgress(80)
      }

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          input_text: inputText,
          input_image: imageUrl,
          input_voice: voiceUrl,
        }),
      })

      setUploadProgress(100)

      const result = await res.json()

      if (res.ok) {
        toast.success("Case submitted successfully!")
        setInputText("")
        setInputImage(null)
        setInputVoice(null)

        if (result.data && result.data.id) {
          router.push(`/case?caseid=${result.data.id}`)
        } else {
          router.push(`/profile?user=${userId}`)
        }
      } else {
        toast.error("Error: " + (result.error || "Failed to submit case"))
      }
    } catch (err) {
      console.error("Submission error:", err)
      toast.error("Failed to submit case")
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50/50 px-4 py-8">
      <Card className="w-full max-w-2xl border-purple-100 shadow-md">
        <CardHeader className="border-b border-purple-100 bg-white">
          <CardTitle className="text-2xl font-bold text-purple-900">Create New Case</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 bg-white">
          <div className="space-y-2">
            <label htmlFor="case-description" className="text-sm font-medium text-purple-900">
              Describe your health concern
            </label>
            <textarea
              id="case-description"
              placeholder="Describe your symptoms or health concern in detail..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 p-4 text-lg border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <FileUpload
                accept="image/*"
                label="Add Image"
                icon={<ImagePlus className="w-4 h-4 mr-2" />}
                onChange={setInputImage}
                value={inputImage}
                className="flex-1"
              />

              <FileUpload
                accept="audio/*"
                label="Add Voice"
                icon={<Mic className="w-4 h-4 mr-2" />}
                onChange={setInputVoice}
                value={inputVoice}
                className="flex-1"
              />
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-purple-100 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-6 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <PlusCircle className="w-5 h-5 mr-2" />
                Submit Case
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-purple-600">
            Your case will be reviewed by our AI system and connected with healthcare professionals if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
