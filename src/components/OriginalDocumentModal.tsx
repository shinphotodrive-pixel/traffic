import React from 'react';
import { DOCUMENT_META } from '../data/standardData';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface OriginalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalDocumentModal: React.FC<OriginalDocumentModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                경찰청 경찰규격서 원문 PDF 뷰어
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  총 210쪽 원본 문서
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {DOCUMENT_META.standardNumber} ({DOCUMENT_META.latestDate} 개정) | 경찰청 교통안전과
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={DOCUMENT_META.pdfPath}
              download="경찰청_무인교통단속장비_경찰규격서_2026.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              다운로드
            </a>
            <a
              href={DOCUMENT_META.pdfPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              새 탭으로 열기
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embed */}
        <div className="flex-1 bg-slate-950 p-2">
          <iframe
            src={`${DOCUMENT_META.pdfPath}#toolbar=1&navpanes=1`}
            className="w-full h-full rounded-xl border border-slate-800"
            title="경찰규격서 원본 PDF"
          />
        </div>
      </div>
    </div>
  );
};
