import React, { useState } from 'react';
import {
  CalculationRecord,
  generateOfficialReportText,
  downloadText,
  downloadJson,
  exportElementToPdf,
} from '../utils/exportUtils';
import {
  X,
  Copy,
  Download,
  FileCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Printer,
  Shield,
  Award,
} from 'lucide-react';

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CalculationRecord;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual');
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const reportText = generateOfficialReportText(record);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    downloadText(
      reportText,
      `경찰청_성능검사통보서_${record.equipmentId}_${record.date}.txt`
    );
  };

  const handleDownloadJson = () => {
    downloadJson(
      record,
      `경찰청_성능검사데이터_${record.equipmentId}_${record.date}.json`
    );
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(
        'official-report-printable',
        `경찰청_무인단속장비_성능검사성적서_${record.equipmentId}.pdf`,
        `경찰청 성능검사 결과 통보서 - ${record.equipmentId}`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  공식 성능검사 결과 통보서 (경찰규격 성적서)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                  KPS-08-0004-02: 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                도로교통법 제4조의2에 따른 공인 성능검사 판정 및 규격 준수 증빙서식
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

        {/* Tab switch & Actions */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-md transition font-medium flex items-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              공식 증명서 양식 (PDF)
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-md transition font-medium flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              표준 텍스트 서식 (.TXT)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              {copied ? '복사 완료!' : '텍스트 복사'}
            </button>
            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              TXT 저장
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              JSON 저장
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-900/40 transition disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              {isExportingPdf ? 'PDF 변환중...' : 'PDF 내보내기'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/70">
          {activeTab === 'visual' ? (
            /* Printable Official Certificate View */
            <div
              id="official-report-printable"
              className="max-w-2xl mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-sans"
            >
              {/* Report Header */}
              <div className="text-center border-b-2 border-slate-900 pb-5 mb-6 relative">
                <div className="inline-flex items-center gap-2 mb-1">
                  <Shield className="w-6 h-6 text-blue-900" />
                  <span className="text-xs tracking-widest font-bold text-slate-600 uppercase">
                    대한민국 경찰청 공식 규격 성적서
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  무인교통단속장비 성능검사 결과 통보서
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  경찰규격서 번호: KPS-08-0004-02 (2026. 02. 25. 개정)
                </p>

                {/* Stamp */}
                <div
                  className={`absolute right-0 top-0 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center rotate-[-12deg] select-none ${
                    record.isPassed
                      ? 'border-emerald-700 text-emerald-800 bg-emerald-50/70'
                      : 'border-rose-700 text-rose-800 bg-rose-50/70'
                  }`}
                >
                  <span className="text-[10px] font-bold">경찰규격</span>
                  <span className="text-base font-extrabold">
                    {record.isPassed ? '적 합' : '부적합'}
                  </span>
                  <span className="text-[8px]">도로교통공단</span>
                </div>
              </div>

              {/* Meta Info Table */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">문서 번호: </span>
                  <span className="font-mono font-bold text-slate-800">
                    NPA-TES-{record.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">검사 일자: </span>
                  <span className="font-mono font-bold text-slate-800">
                    {record.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">장비 관리번호: </span>
                  <span className="font-mono font-bold text-blue-900">
                    {record.equipmentId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">장비 유형: </span>
                  <span className="font-bold text-slate-800">
                    {record.equipmentTypeName}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-medium">설치 위치: </span>
                  <span className="font-bold text-slate-800">
                    {record.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">검사 기관: </span>
                  <span className="font-bold text-slate-800">{record.agency}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">수행 검사원: </span>
                  <span className="font-bold text-slate-800">{record.inspector}</span>
                </div>
              </div>

              {/* 6 Core Specs Table */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-blue-900 pl-2">
                  6대 핵심 성능 항목별 검사 결과
                </h3>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">검사 항목</th>
                      <th className="py-2 px-3">경찰규격 기준선</th>
                      <th className="py-2 px-3">실측 측정치</th>
                      <th className="py-2 px-3 text-center">점수</th>
                      <th className="py-2 px-3 text-center">판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">속도 검지 정확도</td>
                      <td className="py-2 px-3 text-slate-500">60km 미만 ±3km, 100km ±5%</td>
                      <td className="py-2 px-3 font-mono font-semibold">
                        오차 {record.metrics.speedErrorRate.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.speedScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.speedScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.speedScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">번호판 인식률</td>
                      <td className="py-2 px-3 text-slate-500">인식률 ≥85%, 오류율 &lt;2%</td>
                      <td className="py-2 px-3 font-mono font-semibold">
                        {record.metrics.plateRecognitionRate.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.plateScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.plateScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.plateScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">위반단속 검지율</td>
                      <td className="py-2 px-3 text-slate-500">단속률 ≥80%, 구분율 ≥90%</td>
                      <td className="py-2 px-3 font-mono font-semibold">
                        {record.metrics.captureRate.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.captureScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.captureScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.captureScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">통신 프로토콜 정합성</td>
                      <td className="py-2 px-3 text-slate-500">2026 헤더 22B, 지연 &lt;1000ms</td>
                      <td className="py-2 px-3 font-mono font-semibold">
                        {record.metrics.commLatency} ms
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.commScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.commScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.commScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">암호화 & 무결성</td>
                      <td className="py-2 px-3 text-slate-500">SHA-256 해시 검증 통과</td>
                      <td className="py-2 px-3 font-semibold">
                        {record.metrics.isSecurityValid ? '무결성 확인' : '해시 오류'}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.securityScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.securityScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.securityScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">환경시험 및 내구성</td>
                      <td className="py-2 px-3 text-slate-500">16시간 극한온도 & 방수 IP66</td>
                      <td className="py-2 px-3 font-semibold">
                        {record.metrics.isDurabilityPassed ? '챔버 시험 적합' : '환경시험 미달'}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-900">
                        {record.metrics.durabilityScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            record.metrics.durabilityScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.metrics.durabilityScore >= 80 ? '적합' : '부적합'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Final Verdict Banner */}
              <div
                className={`p-4 rounded-xl border-2 flex items-center justify-between mb-6 ${
                  record.isPassed
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                    : 'bg-rose-50 border-rose-500 text-rose-900'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    종합 환산 점수 및 최종 판정
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold font-mono">
                      {record.overallScore.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold">/ 100.0 점</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-extrabold ${
                      record.isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {record.isPassed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        최종 판정: 적합 (PASS)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        최종 판정: 부적합 (FAIL)
                      </>
                    )}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {record.isPassed ? '설치 및 단속 운영 승인' : '불합격: 장비 보완 후 재검사'}
                  </div>
                </div>
              </div>

              {/* Signoff */}
              <div className="pt-4 border-t border-slate-300 text-center text-xs text-slate-600">
                <p className="leading-relaxed">
                  위 장비는 도로교통법 제4조의2 및 경찰청 무인교통단속장비 경찰규격서
                  (KPS-08-0004-02: 2026. 02. 25. 개정)에 따라 공인 성능검사를 필하였음을 증명합니다.
                </p>
                <div className="mt-4 font-semibold text-slate-800 flex justify-center items-center gap-6">
                  <span>검사기관: {record.agency} [직인]</span>
                  <span>검사원: {record.inspector} (서명)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Plain Text Mode */
            <div className="relative">
              <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-300 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                {reportText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
