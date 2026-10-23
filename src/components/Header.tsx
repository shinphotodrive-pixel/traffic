import React from 'react';
import { FileText, Shield, ExternalLink, Download } from 'lucide-react';
import { DOCUMENT_META } from '../data/standardData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenPdf }) => {
  const navItems = [
    { id: 'spec', label: '규격서 전문' },
    { id: 'matrix', label: '장비별 단속 매트릭스' },
    { id: 'calculator', label: '성능검사 판정 계산기' },
    { id: 'protocol', label: 'TCP/IP 통신규약' },
    { id: 'durability', label: '내구성·환경 시험' },
    { id: 'signage', label: '단속표지 규격' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('spec')}
              className="text-left font-bold text-slate-100 hover:text-white transition-colors"
            >
              <span className="text-base tracking-tight block">무인교통단속장비 경찰규격서</span>
              <span className="text-xs text-slate-400 font-mono block">KPS-08-0004-02 : 2026</span>
            </button>
          </div>

          {/* Zone 2: Concise navigation links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              title="원문 PDF 문서 열람"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>원문 규격서 (210P)</span>
            </button>
          </div>
        </div>

        {/* Mobile sub-navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
