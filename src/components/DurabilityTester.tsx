import React, { useState } from 'react';
import {
  ThermometerSnowflake,
  Activity,
  Droplets,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Flame,
  Clock
} from 'lucide-react';
import { DURABILITY_TESTS } from '../data/standardData';

export const DurabilityTester: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const chamberSteps = [
    {
      step: 1,
      title: '시험 시작 및 저온 냉각',
      temp: '상온 ➔ -30 ℃',
      duration: '최소 3시간',
      voltage: 'AC 220V (정격)',
      door: '챔버 닫힘 / 함체문 개방',
      humidity: 'OFF',
      action: '챔버 내부 온도를 -30℃까지 서서히 냉각 안정화',
    },
    {
      step: 2,
      title: '저온 저전압 시험',
      temp: '-30 ℃ 유지',
      duration: '5시간 지속 + 전원차단 복구',
      voltage: 'AC 190V (정격하한전압)',
      door: '함체문 열림',
      humidity: 'OFF',
      action: '5시간 지속 후 5시간 전원 차단 후 전원 복구 정상 부팅 확인. 트리거 영상취득 및 조명 기능 검증.',
    },
    {
      step: 3,
      title: '저온 고전압 시험',
      temp: '-30 ℃ 유지',
      duration: '약 1시간 동작',
      voltage: 'AC 250V (정격상한전압)',
      door: '함체문 열림',
      humidity: 'OFF',
      action: '상한전압 인가 상태에서 연속 트리거 영상 취득 및 팬틸트 작동 점검.',
    },
    {
      step: 4,
      title: '고온 승온 단계',
      temp: '-30 ℃ ➔ 60 ℃',
      duration: '최소 6시간',
      voltage: 'AC 220V',
      door: '함체문 열림',
      humidity: '상대습도 18%',
      action: '시간당 17℃씩 일정하게 승온시켜 열충격을 방지하며 60℃ 도달.',
    },
    {
      step: 5,
      title: '고온 고전압 시험',
      temp: '60 ℃ 고온',
      duration: '약 15시간 시험',
      voltage: 'AC 250V (정격상한전압)',
      door: '함체문 열림',
      humidity: '상대습도 18% (최고 95% 초과 금지)',
      action: '극심한 열기 환경에서 연속 동작 및 부품 열화 상태 점검.',
    },
    {
      step: 6,
      title: '고온 저전압 시험',
      temp: '60 ℃ 고온',
      duration: '약 1시간 동작',
      voltage: 'AC 190V (정격하한전압)',
      door: '함체문 열림',
      humidity: '상대습도 18%',
      action: '고온 상태에서 최저 입력 전압 인가 시 정상 동작 여부 확인.',
    },
    {
      step: 7,
      title: '실온 복귀 및 정상상태 시험 (종료)',
      temp: '실온 (15 ℃ ~ 27 ℃)',
      duration: '약 1시간 적응',
      voltage: 'AC 220V (정격)',
      door: '정상 상태',
      humidity: 'OFF',
      action: '정상 전압 인가 및 1시간 안정화 후 최종 트리거·조명·팬틸트 정상 검증.',
    },
  ];

  const filteredTests = DURABILITY_TESTS.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <span>제Ⅴ장 무인교통단속장비 내구성 시험</span>
          <span>·</span>
          <span>한국도로교통공단 / KOLAS 인정기관 시험성적서 필수</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          내구성 시험 규격 & 16시간 환경시험 프로파일
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          -30℃ 저온부터 60℃ 고온까지 온습도·전압 복합 챔버 시험 사이클 및 진동, 살수 방수, 전기 서지 규격
        </p>
      </div>

      {/* Interactive Chamber Temperature & Voltage Profile Visualizer (<그림 61>) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ThermometerSnowflake className="w-5 h-5 text-blue-600" />
              환경시험 온·습도 및 전압 진행순서 (총 16시간 PROFILE, 그림 61)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              단계별 클릭하여 챔버 온도, 입력 전압(190V/220V/250V), 함체 도어 상태 및 세부 시험 방법을 확인하세요.
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
            -30 ℃ ~ +60 ℃
          </span>
        </div>

        {/* Graphical Timeline Step Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {chamberSteps.map((s) => {
            const isSelected = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold opacity-75">
                    STEP {s.step}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-300' : 'text-blue-600'}`}>
                    {s.duration}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">{s.title}</div>
                <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {s.temp}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Specifications Board */}
        {(() => {
          const cur = chamberSteps.find((s) => s.step === activeStep) || chamberSteps[0];
          return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {cur.step}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{cur.title}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <Clock className="w-3.5 h-3.5" /> {cur.duration}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">챔버 시험 온도</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{cur.temp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">인가 전압 (AC)</span>
                  <span className="font-bold font-mono text-blue-700 text-sm">{cur.voltage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">챔버 및 함체 도어</span>
                  <span className="font-semibold text-slate-800">{cur.door}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">습도 제어 조건</span>
                  <span className="font-semibold text-slate-800">{cur.humidity}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-lg p-3 leading-relaxed">
                <strong className="text-slate-900">검사 내용 및 절차: </strong>
                {cur.action}
              </p>
            </div>
          );
        })()}
      </div>

      {/* 7 Durability Test Items Category Selector & Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              7대 내구성 시험 규격 세부 항목 (표 173 ~ 표 175)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              외관 전수검사, 기능, 챔버 온습도, 진동(공진/내구/스윕), 살수 방수, 전기 서지, IR LED 광학 시험
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto">
            {['all', '외관', '기능', '환경', '진동', '내수성', '전기', '광학'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? '전체' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Test Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all bg-slate-50/40"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {test.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 border border-slate-200 rounded">
                  {test.sampleRatio}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 mt-3">
                <div>
                  <span className="text-slate-400 font-semibold block">시험 방법</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{test.method}</p>
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold block">합격 판정 기준</span>
                  <p className="text-slate-900 font-medium mt-0.5 leading-relaxed">{test.criteria}</p>
                </div>
                {test.standardsRef && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                    관련 규격: {test.standardsRef}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
