import React, { useState } from 'react';
import { CalculationRecord, downloadJson } from '../utils/exportUtils';
import {
  X,
  Search,
  Trash2,
  Download,
  UploadCloud,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  MapPin,
  User,
  ShieldAlert,
} from 'lucide-react';

interface HistoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CalculationRecord[];
  onLoadRecord: (record: CalculationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryManagerModal: React.FC<HistoryManagerModalProps> = ({
  isOpen,
  onClose,
  records,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'fail'>('all');
  const [selectedRecord, setSelectedRecord] = useState<CalculationRecord | null>(null);

  if (!isOpen) return null;

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.equipmentTypeName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'pass') return matchesSearch && rec.isPassed;
    if (filterStatus === 'fail') return matchesSearch && !rec.isPassed;
    return matchesSearch;
  });

  const handleExportAll = () => {
    downloadJson(
      {
        exportedAt: new Date().toISOString(),
        standard: 'KPS-08-0004-02:2026',
        totalCount: records.length,
        records,
      },
      `경찰단속장비_성능검사이력_전체_${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                성능검사 히스토리 관리 (로컬 저장소)
              </h3>
              <p className="text-xs text-slate-400">
                기기에 저장된 경찰규격 검사이력 {records.length}건을 조회·불러오기·백업합니다.
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

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="장비ID, 위치, 검사원 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                전체 ({records.length})
              </button>
              <button
                onClick={() => setFilterStatus('pass')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterStatus === 'pass'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                적합 ({records.filter((r) => r.isPassed).length})
              </button>
              <button
                onClick={() => setFilterStatus('fail')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterStatus === 'fail'
                    ? 'bg-rose-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                부적합 ({records.filter((r) => !r.isPassed).length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 disabled:opacity-50 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              JSON 전체 백업
            </button>
            <button
              onClick={() => {
                if (confirm('저장된 모든 성능검사 이력을 삭제하시겠습니까? (복구 불가)')) {
                  onClearAll();
                }
              }}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/60 disabled:opacity-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              전체 비우기
            </button>
          </div>
        </div>

        {/* Content list & Detail split */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* List panel */}
          <div className="md:col-span-7 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                검색 조건에 맞는 검사 이력이 없습니다.
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedRecord?.id === rec.id
                      ? 'bg-blue-950/30 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {rec.equipmentId}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">
                          {rec.equipmentTypeName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold ${
                            rec.isPassed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {rec.isPassed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              적합
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              부적합
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {rec.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {rec.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-bold font-mono ${
                          rec.overallScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {rec.overallScore.toFixed(1)}점
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {rec.inspector}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details / Action panel */}
          <div className="md:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      선택된 검사 기록
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">
                      {selectedRecord.equipmentId}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedRecord.isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {selectedRecord.isPassed ? '적합 (합격)' : '부적합 (불합격)'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">장비 유형</span>
                    <span className="font-medium text-slate-200">
                      {selectedRecord.equipmentTypeName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">설치 위치</span>
                    <span className="font-medium text-slate-200 text-right truncate max-w-[180px]">
                      {selectedRecord.location}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">검사 일자</span>
                    <span className="font-medium text-slate-200 font-mono">
                      {selectedRecord.date}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">검사원 / 기관</span>
                    <span className="font-medium text-slate-200">
                      {selectedRecord.inspector} ({selectedRecord.agency})
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-slate-300 mb-2">
                    6대 규격 세부 채점표
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">속도 검지 정확도:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.speedScore}점 (오차 {selectedRecord.metrics.speedErrorRate.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">차량 번호판 인식:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.plateScore}점 (인식 {selectedRecord.metrics.plateRecognitionRate.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">위반단속 검지율:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.captureScore}점 (검지 {selectedRecord.metrics.captureRate.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2026 프로토콜 통신:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.commScore}점 ({selectedRecord.metrics.commLatency}ms)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SHA-256 데이터 무결성:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.securityScore}점 ({selectedRecord.metrics.isSecurityValid ? '정상' : '실패'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">챔버/내구성 시험:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedRecord.metrics.durabilityScore}점 ({selectedRecord.metrics.isDurabilityPassed ? '통과' : '미달'})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => {
                      onLoadRecord(selectedRecord);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30"
                  >
                    <UploadCloud className="w-4 h-4" />
                    이 결과를 계산기로 불러오기
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        downloadJson(
                          selectedRecord,
                          `성능검사결과_${selectedRecord.equipmentId}_${selectedRecord.date}.json`
                        )
                      }
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      단일 JSON 저장
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`'${selectedRecord.equipmentId}' 검사 이력을 삭제하시겠습니까?`)) {
                          onDeleteRecord(selectedRecord.id);
                          setSelectedRecord(null);
                        }
                      }}
                      className="py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-medium border border-rose-800/60 transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                좌측 목록에서 검사 이력을 선택하시면 상세 채점 결과와 불러오기 옵션이 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
