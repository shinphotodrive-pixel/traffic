import React from 'react';
import { CalculationRecord } from '../utils/exportUtils';
import { History, Award, CheckCircle2, XCircle, ArrowUpRight, FolderOpen, Calendar, MapPin } from 'lucide-react';

interface RecentHistorySummaryCardProps {
  history: CalculationRecord[];
  onLoadRecord: (record: CalculationRecord) => void;
  onOpenFullHistory: () => void;
}

export const RecentHistorySummaryCard: React.FC<RecentHistorySummaryCardProps> = ({
  history,
  onLoadRecord,
  onOpenFullHistory,
}) => {
  const recentFive = history.slice(0, 5);

  if (recentFive.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">
          최근 검사 히스토리가 없습니다
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          위 계산기에서 성능 수치를 입력하고 [결과 저장] 버튼을 누르면 최근 5회차 평균 점수와 규격 적합률이 실시간 요약 카드로 집계됩니다.
        </p>
      </div>
    );
  }

  // Calculate stats for recent up to 5 runs
  const totalScore = recentFive.reduce((sum, r) => sum + r.overallScore, 0);
  const avgScore = totalScore / recentFive.length;
  const passCount = recentFive.filter((r) => r.isPassed).length;
  const passRate = (passCount / recentFive.length) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                최근 5회차 성능 검사 결과 및 규격 적합률 요약
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                최근 {recentFive.length}건 집계
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              로컬 스토리지에 저장된 최근 성능검사 데이터 기반 자동 분석 통계
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFullHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          전체 이력 관리 ({history.length}건)
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Average Score */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">최근 5회차 평균 점수</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-white">
                {avgScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">/ 100점</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {avgScore >= 80 ? '✓ 규격 기준선(80점) 이상 유지' : '⚠️ 기준선 미달 주의'}
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg ${
              avgScore >= 80
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">규격 적합률 (PASS)</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  passRate >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {passRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">({passCount}/{recentFive.length}회 적합)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              경찰청 표준 품질 신뢰도 지표
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg ${
              passRate >= 80
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {passRate >= 80 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Operational Status */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">단속장비 종합 판정 상태</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-sm font-bold ${
                  passRate === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : passRate >= 60
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {passRate === 100 ? '우수 (적합)' : passRate >= 60 ? '양호 (보완검사)' : '부적격 (점검필요)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              최근 검사: {recentFive[0]?.date || '없음'}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-slate-500">최신 장비ID</span>
            <span className="text-xs font-mono font-semibold text-slate-300 truncate max-w-[100px]">
              {recentFive[0]?.equipmentId}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Run List Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">회차</th>
              <th className="py-2.5 px-3">장비관리번호 / 유형</th>
              <th className="py-2.5 px-3">설치장소</th>
              <th className="py-2.5 px-3">검사일시</th>
              <th className="py-2.5 px-3 text-center">종합점수</th>
              <th className="py-2.5 px-3 text-center">판정</th>
              <th className="py-2.5 px-3 text-right">다시 불러오기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-300 font-mono">
            {recentFive.map((rec, idx) => (
              <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                <td className="py-2 px-3 text-slate-500 font-sans">
                  #{recentFive.length - idx}
                </td>
                <td className="py-2 px-3 font-sans">
                  <div className="font-bold text-white font-mono">{rec.equipmentId}</div>
                  <div className="text-[10px] text-slate-400">{rec.equipmentTypeName}</div>
                </td>
                <td className="py-2 px-3 text-slate-300 font-sans max-w-[150px] truncate">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {rec.location}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {rec.date}
                  </span>
                </td>
                <td className="py-2 px-3 text-center font-bold">
                  <span className={rec.overallScore >= 80 ? 'text-blue-400' : 'text-rose-400'}>
                    {rec.overallScore.toFixed(1)}점
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-sans ${
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
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  <button
                    onClick={() => onLoadRecord(rec)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded transition"
                  >
                    불러오기
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
