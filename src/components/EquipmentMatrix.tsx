import React, { useState } from 'react';
import { ENFORCEMENT_FUNCTIONS } from '../data/standardData';
import {
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Search,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';

export const EquipmentMatrix: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'mobile' | 'vehicle' | 'drone'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  const filtered = ENFORCEMENT_FUNCTIONS.filter((fn) => {
    const matchesSearch =
      fn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fn.legalBasis.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && fn[filterType];
  });

  const selectedDetail = ENFORCEMENT_FUNCTIONS.find((f) => f.id === selectedFunction);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              장비 유형별 단속기능 및 성능기준 비교 매트릭스
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                11대 단속기능 전수 비교
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              고정식(전/후면 통합), 이동식(레이저), 차량탑재형(주행중 단속), 드론(UAV) 4개 규격의 적용 범위 및 평가기준 비교
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterType === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            전체 (11)
          </button>
          <button
            onClick={() => setFilterType('fixed')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterType === 'fixed' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            고정식
          </button>
          <button
            onClick={() => setFilterType('mobile')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterType === 'mobile' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            이동식
          </button>
          <button
            onClick={() => setFilterType('vehicle')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterType === 'vehicle' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            차량탑재
          </button>
          <button
            onClick={() => setFilterType('drone')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterType === 'drone' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            드론(UAV)
          </button>
        </div>
      </div>

      {/* Table & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table view (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="단속 명칭, 법적 근거 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500"
            />
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">단속 기능명</th>
                <th className="py-2.5 px-2 text-center">고정식</th>
                <th className="py-2.5 px-2 text-center">이동식</th>
                <th className="py-2.5 px-2 text-center">차량탑재</th>
                <th className="py-2.5 px-2 text-center">드론(UAV)</th>
                <th className="py-2.5 px-3">경찰규격 합격기준</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedFunction(item.id)}
                  className={`cursor-pointer transition ${
                    selectedFunction === item.id
                      ? 'bg-purple-950/40 border-l-4 border-purple-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.legalBasis}</div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.fixed ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.mobile ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.vehicle ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.drone ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400">
                        <Check className="w-4 h-4" />
                        {item.droneNote && <span className="text-[10px] text-amber-400">△</span>}
                      </span>
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] max-w-[220px]">
                    <span className="line-clamp-2">{item.criteriaSummary}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Function Deep-Dive (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          {selectedDetail ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  {selectedDetail.legalBasis}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedDetail.name}
                </h3>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="font-semibold text-white mb-1">기능 상세 설명</p>
                {selectedDetail.description}
                {selectedDetail.droneNote && (
                  <div className="mt-2 text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/40 text-[11px]">
                    ⚠️ 드론(UAV) 운영 특이사항: {selectedDetail.droneNote}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    정량적 합격 판정기준
                  </span>
                  <span className="text-emerald-300 font-semibold">
                    {selectedDetail.criteriaSummary}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    표본 추출 및 검사 시험 대수
                  </span>
                  <span className="text-slate-200">
                    {selectedDetail.samplingStandard}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    목표 허용 공차
                  </span>
                  <span className="font-mono text-purple-300 font-bold">
                    {selectedDetail.targetTolerance}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500">
              좌측 표에서 단속 기능을 선택하시면 법적 근거, 장비별 지원 조건 및 정량적 합격 판정기준이 상세히 표시됩니다.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            * 2026 규격 개정사항: 후면단속 및 가변속도 분리단속이 전면 표준화되었습니다.
          </div>
        </div>
      </div>
    </div>
  );
};
