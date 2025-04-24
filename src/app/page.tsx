"use client";
import Image from 'next/image';
import { useState, useRef } from 'react';
import defaultAvatar from './(components)/defatulAvatar';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<string | null>(defaultAvatar);
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = function (event) {
      if (!event.target?.result) return;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img,img.width, img.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg');

        setPreview(compressedBase64);
        setIsNewImageSelected(true);
        setError('');
      };

      img.src = event.target.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleConvertBase64 = async (e: React.FormEvent, isRemove = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if(isRemove) setPreview(defaultAvatar);
    await navigator.clipboard.writeText(preview!);
  };
  return (
    <div className="min-h-screen flex items-start justify-start bg-red-100">


      <div className="bg-red-200 z-20 w-full ">
        Home
        <form onSubmit={(e) => handleConvertBase64(e)} className="flex flex-col items-center gap-5">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="focus:outline-none"
            >
              <Image
                src={preview}
                alt="Preview"
                width={500}
                height={500}
                className="z-50 rounded-full border-2 border-purple-500 w-[500px] h-[500px] shadow-xl shadow-purple-500/30"
              />
            </button>
          )}
          {error && <p className="text-red-500 text-xs text-shadow-md text-shadow-red-500/20">{error}</p>}
          {success && <p className="text-green-500 text-xs text-shadow-md text-shadow-green-500/20">{success}</p>}

          {/* Action buttons */}
          <div className="flex gap-5 w-full">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg w-[150px] max-[550px]:w-[100px] py-2 border border-blue-500
              hover:scale-105 transition-all duration-300 shadow-xl
              shadow-blue-500/30 hover:shadow-blue-500/50 font-extralight disabled:opacity-50"
              disabled={!isNewImageSelected}
            >
              Convert
            </button>


            <button
              type="button"
              className="bg-gradient-to-r from-red-500 to-red-400
              text-white rounded-lg w-[150px] max-[550px]:w-[100px]
              py-2 border border-red-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-red-500/30 hover:shadow-red-500/50 font-extralight"
              onClick={(e) => handleConvertBase64(e, true)}>
              Remove PFP
            </button>
          </div>
        </form>
        <div className="w-[500px] text-wrap">{preview}</div>
      </div>

    </div >
  );
}
