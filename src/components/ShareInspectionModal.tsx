import React, { useState } from 'react';
import {
  CalculationRecord,
  generateShareableSummaryText,
  generateShareableEmailTemplate,
} from '../utils/exportUtils';
import {
  X,
  Share2,
  Copy,
  Mail,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface ShareInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CalculationRecord;
}

export const ShareInspectionModal: React.FC<ShareInspectionModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = generateShareableSummaryText(record);
  const emailMailto = generateShareableEmailTemplate(record, recipientEmail);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                성능검사 결과 공유하기
              </h3>
              <p className="text-xs text-slate-400">
                클립보드 간편 복사 및 담당자 이메일 템플릿 발송
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Summary Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                메신저 / 업무망 공유용 요약 텍스트
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">복사되었습니다!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    클립보드 복사
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 font-mono text-xs text-slate-300 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed select-all max-h-48 overflow-y-auto">
              {summaryText}
            </pre>
          </div>

          {/* Email Template */}
          <div className="border-t border-slate-800 pt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              담당관 보고 이메일 자동 생성 (KPS-08-0004-02 양식)
            </label>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="수신 담당자 이메일 (예: traffic_officer@police.go.kr)"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <a
                href={emailMailto}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                <Mail className="w-4 h-4" />
                기본 메일 앱으로 보고서 템플릿 전송
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <p className="text-[11px] text-slate-500 leading-tight">
                * 클릭 시 사용자 OS의 기본 이메일 프로그램(Outlook, Mail 등)이 열리며 제목과 6대 성능검사 통보서 본문이 자동으로 완성됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
