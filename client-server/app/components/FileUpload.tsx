// 'use client';

// import { useState } from 'react';

// type FileUploadProps = {
//   accept: string;
//   label: string;
//   icon: string;
//   onChange: (file: File | null) => void;
//   value: File | null;
//   previewUrl?: string | null;
// };

// export default function FileUpload({
//   accept,
//   label,
//   icon,
//   onChange,
//   value,
//   previewUrl
// }: FileUploadProps) {
//   const [preview, setPreview] = useState<string | null>(previewUrl || null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     onChange(file);
    
//     // Create preview for images
//     if (file && file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     } else if (file && file.type.startsWith('audio/')) {
//       setPreview(null); // No preview for audio files
//     } else {
//       setPreview(null);
//     }
//   };

//   const handleRemove = () => {
//     onChange(null);
//     setPreview(null);
//   };

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center gap-4 flex-wrap">
//         <label className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
//           {icon} {label}
//           <input
//             type="file"
//             accept={accept}
//             onChange={handleFileChange}
//             className="hidden"
//           />
//         </label>
//         {value && (
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">{value.name}</span>
//             <button 
//               type="button"
//               onClick={handleRemove}
//               className="text-red-500 hover:text-red-700 text-sm"
//             >
//               ✕
//             </button>
//           </div>
//         )}
//       </div>

//       {preview && (
//         <div className="mt-2 relative">
//           <img 
//             src={preview} 
//             alt="Preview" 
//             className="max-h-40 rounded-md border border-gray-200"
//           />
//         </div>
//       )}

//       {!preview && previewUrl && previewUrl.startsWith('http') && (
//         <div className="mt-2 relative">
//           {previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
//             <img 
//               src={previewUrl} 
//               alt="Stored file" 
//               className="max-h-40 rounded-md border border-gray-200"
//             />
//           ) : previewUrl.toLowerCase().match(/\.(mp3|wav|ogg|m4a)$/) ? (
//             <audio 
//               controls
//               src={previewUrl}
//               className="w-full"
//             />
//           ) : (
//             <div className="p-2 bg-gray-100 rounded-md text-sm">
//               Stored file: {previewUrl.split('/').pop()}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type FileUploadProps = {
  accept: string
  label: string
  icon: React.ReactNode
  onChange: (file: File | null) => void
  value: File | null
  previewUrl?: string | null
  className?: string
}

export function FileUpload({ accept, label, icon, onChange, value, previewUrl, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file && file.type.startsWith("audio/")) {
      setPreview(null) 
    } else {
      setPreview(null)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-full cursor-pointer hover:bg-purple-200 transition-colors">
          {icon} {label}
          <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </label>
        {value && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
            <span className="text-sm text-purple-700 truncate max-w-[150px]">{value.name}</span>
            <Button
              type="button"
              onClick={handleRemove}
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full text-purple-700 hover:text-purple-900 hover:bg-purple-100 p-0"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}
      </div>

      {preview && (
        <div className="mt-2 relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="max-h-40 rounded-md border border-purple-200"
          />
        </div>
      )}

      {!preview && previewUrl && previewUrl.startsWith("http") && (
        <div className="mt-2 relative">
          {previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Stored file"
              className="max-h-40 rounded-md border border-purple-200"
            />
          ) : previewUrl.toLowerCase().match(/\.(mp3|wav|ogg|m4a)$/) ? (
            <audio controls src={previewUrl} className="w-full" />
          ) : (
            <div className="p-2 bg-purple-50 rounded-md text-sm text-purple-700">
              Stored file: {previewUrl.split("/").pop()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
