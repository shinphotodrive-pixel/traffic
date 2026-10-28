import React from 'react';
import { DOCUMENT_META } from '../data/standardData';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPdf }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 border border-blue-400/30">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                무인교통단속장비 경찰규격서
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                {DOCUMENT_META.standardNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>경찰청 교통안전과</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                최신 개정: {DOCUMENT_META.latestDate}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">원문 PDF (210쪽)</span>
            <span className="sm:hidden">원문 PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
