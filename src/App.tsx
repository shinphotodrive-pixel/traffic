import React, { useState } from 'react';
import { Header } from './components/Header';
import { PerformanceCalculator } from './components/PerformanceCalculator';
import { ProtocolInspector } from './components/ProtocolInspector';
import { SpecificationViewer } from './components/SpecificationViewer';
import { EquipmentMatrix } from './components/EquipmentMatrix';
import { DurabilityTester } from './components/DurabilityTester';
import { SignageGuide } from './components/SignageGuide';
import { OriginalDocumentModal } from './components/OriginalDocumentModal';
import {
  Calculator,
  Network,
  BookOpen,
  Layers,
  ThermometerSnowflake,
  Signpost,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'calc' | 'protocol' | 'spec' | 'matrix' | 'durability' | 'signage'>('calc');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [specTargetChapterId, setSpecTargetChapterId] = useState<string | undefined>(undefined);
  const [specTargetSectionId, setSpecTargetSectionId] = useState<string | undefined>(undefined);

  const handleNavigateToSpec = (chapterId: string, sectionId: string) => {
    setSpecTargetChapterId(chapterId);
    setSpecTargetSectionId(sectionId);
    setCurrentTab('spec');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onOpenPdf={() => setIsPdfModalOpen(true)} />

      {/* Navigation Tabs Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setCurrentTab('calc')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'calc'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              성능검사 판정 계산기
            </button>

            <button
              onClick={() => setCurrentTab('protocol')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'protocol'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Network className="w-4 h-4" />
              통신 프로토콜 인스펙터
            </button>

            <button
              onClick={() => setCurrentTab('spec')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'spec'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              규격서 전문 열람관
            </button>

            <button
              onClick={() => setCurrentTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'matrix'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              장비별 비교 매트릭스
            </button>

            <button
              onClick={() => setCurrentTab('durability')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'durability'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ThermometerSnowflake className="w-4 h-4" />
              환경·내구성 시험 (챔버)
            </button>

            <button
              onClick={() => setCurrentTab('signage')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                currentTab === 'signage'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Signpost className="w-4 h-4" />
              안내표지 설치기준
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'calc' && (
          <PerformanceCalculator onNavigateToSpec={handleNavigateToSpec} />
        )}
        {currentTab === 'protocol' && <ProtocolInspector />}
        {currentTab === 'spec' && (
          <SpecificationViewer
            onOpenPdf={() => setIsPdfModalOpen(true)}
            initialChapterId={specTargetChapterId}
            initialSectionId={specTargetSectionId}
          />
        )}
        {currentTab === 'matrix' && <EquipmentMatrix />}
        {currentTab === 'durability' && <DurabilityTester />}
        {currentTab === 'signage' && <SignageGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-400">
            경찰청 교통안전과 무인교통단속장비 경찰규격서 (KPS-08-0004-02: 2026. 02. 25. 개정) 기술 포털
          </p>
          <p className="text-[11px] text-slate-600">
            관련 법령: 도로교통법 제4조의2, 제15조, 제17조, 제60조 및 동법 시행규칙 제14조의2 | 인증기관: 도로교통공단 (KoROAD)
          </p>
        </div>
      </footer>

      {/* 210-Page Original PDF Modal */}
      <OriginalDocumentModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
