import React, { useRef } from 'react';

interface ImageUploadProps {
  label: string;
  image: File | null;
  onImageChange: (file: File) => void;
  onRemove: () => void;
  previewUrl: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, image, onImageChange, onRemove, previewUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col w-full h-full">
      <span className="text-sm font-semibold text-slate-600 mb-2 block uppercase tracking-wider">{label}</span>
      <div 
        className={`relative flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 h-64 md:h-80 overflow-hidden ${
          image ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={onRemove}
                className="bg-white/90 text-red-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-white transition-colors"
              >
                삭제
              </button>
              <button 
                 onClick={() => inputRef.current?.click()}
                 className="bg-indigo-600/90 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-600 transition-colors"
              >
                변경
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="text-center p-6 cursor-pointer w-full h-full flex flex-col items-center justify-center"
            onClick={() => inputRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-600 font-medium">클릭하여 이미지 업로드</p>
            <p className="text-slate-400 text-sm mt-1">또는 파일을 여기로 드래그하세요</p>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
};