import React, { useState } from 'react';
import { Header } from './components/Header';
import { SpecificationViewer } from './components/SpecificationViewer';
import { EquipmentMatrix } from './components/EquipmentMatrix';
import { PerformanceCalculator } from './components/PerformanceCalculator';
import { ProtocolInspector } from './components/ProtocolInspector';
import { DurabilityTester } from './components/DurabilityTester';
import { SignageGuide } from './components/SignageGuide';
import { OriginalDocumentModal } from './components/OriginalDocumentModal';
import { DOCUMENT_META } from './data/standardData';
import { Shield, BookOpen, Layers, Calculator, Binary, ThermometerSnowflake, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('spec');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPdf={() => setIsPdfModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'spec' && (
          <SpecificationViewer
            onOpenPdf={() => setIsPdfModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'matrix' && <EquipmentMatrix />}
        {activeTab === 'calculator' && <PerformanceCalculator />}
        {activeTab === 'protocol' && <ProtocolInspector />}
        {activeTab === 'durability' && <DurabilityTester />}
        {activeTab === 'signage' && <SignageGuide />}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-bold text-sm block">
                  {DOCUMENT_META.title} 디지털 기술 규격 포털
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  Standard No. {DOCUMENT_META.standardNumber} · {DOCUMENT_META.authority}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setActiveTab('spec')}
                className="hover:text-slate-200 transition-colors"
              >
                규격서 조항
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className="hover:text-slate-200 transition-colors"
              >
                단속 매트릭스
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className="hover:text-slate-200 transition-colors"
              >
                판정 계산기
              </button>
              <button
                onClick={() => setActiveTab('protocol')}
                className="hover:text-slate-200 transition-colors"
              >
                통신 프로토콜
              </button>
              <button
                onClick={() => setActiveTab('durability')}
                className="hover:text-slate-200 transition-colors"
              >
                내구성 시험
              </button>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                원문 PDF 열람
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-500">
            <div className="space-y-1">
              <p>
                법적 근거: 도로교통법 제4조의2 (무인 교통단속용장비의 설치·관리) · 제정 1998.09.02 · 최신 개정 {DOCUMENT_META.latestDate}
              </p>
              <p>
                공인 검사·인증 기관: 한국도로교통공단, 한국인정기구(KOLAS) 인정 시험기관
              </p>
            </div>
            <div className="font-mono text-[11px] text-slate-500 text-right">
              Traffic Enforcement System Standard (KPS-08-0004-02: 2026)
            </div>
          </div>
        </div>
      </footer>

      {/* PDF Modal */}
      <OriginalDocumentModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
