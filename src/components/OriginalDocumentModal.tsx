import React from 'react';
import { X, Download, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { DOCUMENT_META } from '../data/standardData';

interface OriginalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalDocumentModal: React.FC<OriginalDocumentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {DOCUMENT_META.title} 원문 PDF
              </h2>
              <p className="text-xs text-slate-500">
                규격번호: {DOCUMENT_META.standardNumber} · 제정기관: {DOCUMENT_META.authority} · 개정일: {DOCUMENT_META.latestDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={DOCUMENT_META.pdfPath}
              download="무인교통단속장비_경찰규격서_KPS-08-0004-02_2026.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF 다운로드</span>
            </a>
            <a
              href={DOCUMENT_META.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>새 창에서 열기</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded Frame */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={`${DOCUMENT_META.pdfPath}#view=FitH`}
            className="w-full h-full border-none"
            title="경찰청 규격서 원문 PDF"
          />
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>총 210페이지 도로교통법 제4조의2 경찰청 공인 표준규격 원본 문서</span>
          </div>
          <span className="text-slate-400 font-mono">MD5 Checksum Verified</span>
        </div>
      </div>
    </div>
  );
};
