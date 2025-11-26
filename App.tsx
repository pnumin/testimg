import React, { useState, useEffect } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { DifferenceOverlay } from './components/DifferenceOverlay';
import { analyzeDifferences } from './services/geminiService';
import { AppState, AnalysisResult } from './types';

export default function App() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoveredDiffId, setHoveredDiffId] = useState<string | null>(null);

  // Handle preview generation
  useEffect(() => {
    if (fileA) {
      const url = URL.createObjectURL(fileA);
      setPreviewA(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewA(null);
    }
  }, [fileA]);

  useEffect(() => {
    if (fileB) {
      const url = URL.createObjectURL(fileB);
      setPreviewB(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewB(null);
    }
  }, [fileB]);

  const handleCompare = async () => {
    if (!fileA || !fileB) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const data = await analyzeDifferences(fileA, fileB);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("이미지 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (API Key를 확인하세요)");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setFileA(null);
    setFileB(null);
    setResult(null);
    setAppState(AppState.IDLE);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">도면 비교 분석기 <span className="text-indigo-600 text-sm font-normal bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">AI Beta</span></h1>
          </div>
          <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">사용 방법</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {appState === AppState.ERROR && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* 1. Upload Section */}
        {appState !== AppState.SUCCESS && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">도면의 차이점을 찾아보세요</h2>
              <p className="text-lg text-slate-600">
                원본 도면과 수정된 도면을 업로드하면 Gemini AI가 미세한 차이점까지 분석하여 시각적으로 표시해드립니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto">
              <ImageUpload 
                label="이미지 A (원본)" 
                image={fileA} 
                onImageChange={setFileA} 
                onRemove={() => setFileA(null)} 
                previewUrl={previewA}
              />
              <ImageUpload 
                label="이미지 B (변경본)" 
                image={fileB} 
                onImageChange={setFileB} 
                onRemove={() => setFileB(null)} 
                previewUrl={previewB}
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleCompare}
                disabled={!fileA || !fileB || appState === AppState.ANALYZING}
                className={`
                  relative px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1
                  ${(!fileA || !fileB) ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30'}
                  ${appState === AppState.ANALYZING ? 'cursor-wait opacity-90' : ''}
                `}
              >
                {appState === AppState.ANALYZING ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                  </span>
                ) : (
                  "차이점 비교하기"
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. Result View */}
        {appState === AppState.SUCCESS && result && previewA && previewB && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800">분석 결과</h2>
              <button 
                onClick={handleReset}
                className="text-slate-500 hover:text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ← 처음으로 돌아가기
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">요약</h3>
              <p className="text-slate-800 leading-relaxed">{result.summary}</p>
            </div>

            {/* Main Visual Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[60vh]">
               <DifferenceOverlay 
                  title="원본 (Original)"
                  imageSrc={previewA}
                  differences={result.differences}
                  hoveredId={hoveredDiffId}
                  setHoveredId={setHoveredDiffId}
               />
               <DifferenceOverlay 
                  title="변경본 (Modified)"
                  imageSrc={previewB}
                  differences={result.differences}
                  hoveredId={hoveredDiffId}
                  setHoveredId={setHoveredDiffId}
               />
            </div>

            {/* Differences List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">감지된 차이점 목록 ({result.differences.length})</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {result.differences.map((diff) => (
                  <li 
                    key={diff.id}
                    onMouseEnter={() => setHoveredDiffId(diff.id)}
                    onMouseLeave={() => setHoveredDiffId(null)}
                    className={`px-6 py-4 cursor-pointer transition-colors flex items-start gap-4 ${
                      hoveredDiffId === diff.id ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                       hoveredDiffId === diff.id ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {diff.id}
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium mb-1">차이점 #{diff.id}</p>
                      <p className="text-slate-600 text-sm">{diff.description}</p>
                    </div>
                  </li>
                ))}
                {result.differences.length === 0 && (
                  <li className="px-6 py-8 text-center text-slate-500">
                    차이점이 발견되지 않았습니다. 두 이미지가 동일해 보입니다.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}