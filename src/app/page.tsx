"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import defaultAvatar from './(components)/defatulAvatar';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(defaultAvatar);
  const [formattedBase64, setFormattedBase64] = useState<string>('');
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [base64Size, setBase64Size] = useState<number | null>(null);
  const [pngSize, setPngSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(100);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (error || success) {
      timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [error, success]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileSize(file.size);
    const reader = new FileReader();

    reader.onload = function (event) {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setPreview(base64String);
      }

      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setOriginalImage(event.target!.result as string);
        applyQualityCompression(event.target!.result as string, quality);
        setIsNewImageSelected(true);
        setError('');
      };
      img.src = event.target!.result as string;
    };

    reader.readAsDataURL(file);
  };

  const applyQualityCompression = (base64: string, quality: number) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = quality / 100;

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(compressedBase64);
      splitBase64(compressedBase64);
      setBase64Size(new Blob([compressedBase64]).size);

      canvas.toBlob((blob) => {
        if (blob) {
          setPngSize(blob.size);
        }
      }, 'image/png');
    };
    img.src = base64;
  };

  const handleConvertBase64 = async (e: React.FormEvent, isRemove = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRemove) {
      setBase64Size(new Blob([preview!]).size);
      setPreview(defaultAvatar);
      setOriginalImage(null);
      setIsNewImageSelected(false);
      setFileSize(null);
      setBase64Size(null);
      setPngSize(null);
      return;
    }

    if (preview) {
      await navigator.clipboard.writeText(preview);
      setSuccess('Image Base64 copied to clipboard!');
    } else {
      setError('No image selected!');
    }
  };

  const handleSliderChange = (value: number) => {
    setQuality(value);
    if (originalImage) {
      applyQualityCompression(originalImage, value);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const handleDownloadPng = () => {
    if (!preview) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'compressed-image.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.src = preview;
  };

  const splitBase64 = (base64String: string, chunkSize = 1000) => {
    const chunks: string[] = [];
    for (let i = 0; i < base64String.length; i += chunkSize) {
      chunks.push(base64String.slice(i, i + chunkSize));
    }

    const joinedChunks = `export default base64Image = [\n  ${chunks.map(chunk => `"${chunk}"`).join(',\n  ')}\n].join("");`;

    setFormattedBase64(joinedChunks);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4">
      <div className="text-xl font-semibold text-shadow-md text-shadow-black/20 flex flex-col  items-center ">
        Image to Base64 Converter
        <div className="text-xs">
          Made by @itsmeprinceyt
        </div>
        <Link className="text-xs hover:underline" href="https://github.com/itsmeprinceyt/base64-image-converter">GitHub Repository</Link>
      </div>
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 space-y-6 flex flex-col justify-center">
        <form onSubmit={(e) => handleConvertBase64(e)} className="space-y-4 flex flex-col items-center">
          <div className="flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>

          {preview && imageDimensions && (
            <div className="w-[300px] flex justify-center">
              <Image
                src={preview}
                alt="Preview"
                width={imageDimensions.width}
                height={imageDimensions.height}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          {isNewImageSelected && (
            <div className="text-center space-y-1">
              <label className="text-gray-700 text-sm">
                Compression Quality: <span className="font-semibold">{quality}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}

          <div className="text-sm text-center text-gray-600 space-y-1">
            {fileSize !== null && <p>Original Size: {formatBytes(fileSize)}</p>}
            {base64Size !== null && <p>Base64 Size: {formatBytes(base64Size)}</p>}
            {pngSize !== null && <p>PNG Size: {formatBytes(pngSize)}</p>}
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          {success && <p className="text-green-500 text-xs text-center">{success}</p>}

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-5 py-2 rounded-md shadow hover:bg-blue-600 transition"
            >
              Upload Photo
            </button>
            <button
              type="submit"
              disabled={!isNewImageSelected}
              className="bg-yellow-500 text-white px-5 py-2 rounded-md shadow hover:bg-yellow-600 transition disabled:opacity-50"
            >
              Copy Base64
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!isNewImageSelected}
              className="bg-green-500 text-white px-5 py-2 rounded-md shadow hover:bg-green-600 transition disabled:opacity-50"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={(e) => handleConvertBase64(e, true)}
              className="bg-red-500 text-white px-5 py-2 rounded-md shadow hover:bg-red-600 transition"
            >
              Remove PFP
            </button>
          </div>
        </form>

        {/* Base64 Output */}
        <div className="bg-gray-100 rounded-md border p-4 h-64 overflow-auto text-xs whitespace-pre-wrap break-words">
          {preview}
        </div>

        {/* Split Base64 Output */}
        <div className="bg-gray-100 rounded-md border p-4 h-64 overflow-auto text-xs whitespace-pre-wrap break-words">
          {formattedBase64}
        </div>
      </div>
    </div>
  );
}