import React, { useState } from 'react';
import { DURABILITY_TESTS, SYSTEM_ABNORMAL_ITEMS } from '../data/standardData';
import {
  ThermometerSnowflake,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const DurabilityTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chamber' | 'specs' | 'abnormal'>('chamber');

  // Chamber 16-hour profile data
  // -30°C ~ +60°C cycle according to Chapter IV
  const chamberData = [
    { hour: '0h', temp: 25, stage: '상온 안정화 (25℃)' },
    { hour: '2h', temp: -30, stage: '급속 저온 강하 (-30℃)' },
    { hour: '4h', temp: -30, stage: '극한 저온 유지 (-30℃ 2시간 유지)' },
    { hour: '5h', temp: -30, stage: '저온 시동 및 촬영 기능 시험' },
    { hour: '7h', temp: 0, stage: '승온 과정' },
    { hour: '9h', temp: 25, stage: '상온 복귀 (25℃)' },
    { hour: '11h', temp: 60, stage: '고온 승온 (+60℃)' },
    { hour: '13h', temp: 60, stage: '극한 고온 유지 (+60℃ 2시간 유지)' },
    { hour: '14h', temp: 60, stage: '고온 연속 연속단속 부하 시험' },
    { hour: '15h', temp: 35, stage: '상온 강하' },
    { hour: '16h', temp: 25, stage: '시험 종료 및 상온 복원력 검증' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <ThermometerSnowflake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              환경시험 및 내구성 기준 (제4장 시험방법)
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                16시간 -30℃~+60℃ 챔버 시험
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              극한 온·습도, 진동(KS C 0220), 방수(IP66), 서지내성 6kV 등 경찰청 인증 필수 내구성 규격
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('chamber')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'chamber' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            온도 챔버 프로파일
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'specs' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            7대 내구성 시험항목
          </button>
          <button
            onClick={() => setActiveTab('abnormal')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'abnormal' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            시스템 이상감지 (11종)
          </button>
        </div>
      </div>

      {/* Tab 1: Chamber Graph */}
      {activeTab === 'chamber' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white">
                16시간 극한 환경 챔버 시험 사이클 (그림 13 규격)
              </h3>
              <p className="text-xs text-slate-400">
                -30℃에서 +60℃까지 단계별 온도 변화 하에서 장비 오동작 유무와 데이터 손실 0건을 검증합니다.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                최저 저온: -30℃
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                최고 고온: +60℃
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chamberData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  domain={[-40, 70]}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="℃"
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                <ReferenceLine y={-30} stroke="#38bdf8" label={{ value: '저온 한계 -30℃', fill: '#38bdf8', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#f43f5e" label={{ value: '고온 한계 +60℃', fill: '#f43f5e', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                          <p className="font-bold text-white mb-1">경과 시간: {data.hour}</p>
                          <p className="text-cyan-400 font-mono font-bold text-sm">
                            챔버 온도: {data.temp} ℃
                          </p>
                          <p className="text-slate-400 mt-1">{data.stage}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Stage milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">1단계: 저온 시험</span>
              <strong className="text-sm text-white mt-1 block">-30℃ 저온 시동 & 촬영</strong>
              <p className="text-xs text-slate-400 mt-1">
                챔버 -30℃ 도달 후 2시간 이상 유지 상태에서 전원 재투입 시동 및 60프레임 연속 캡처 성공
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">2단계: 고온 시험</span>
              <strong className="text-sm text-white mt-1 block">+60℃ 고온 지속 부하</strong>
              <p className="text-xs text-slate-400 mt-1">
                +60℃ 열기 속에서 CPU 쓰로틀링 없이 신경망 가속기 번호인식 모듈 정상 연산 유지
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">3단계: 복원력 검증</span>
              <strong className="text-sm text-white mt-1 block">상온 복귀 후 무결성</strong>
              <p className="text-xs text-slate-400 mt-1">
                25℃ 상온 안정화 후 플래시 메모리 저장 이미지의 SHA-256 해시값 변조 및 손실 0건 입증
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 7 Durability Specs */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DURABILITY_TESTS.map((spec) => (
            <div
              key={spec.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    {spec.category}
                  </span>
                  <h4 className="text-sm font-bold text-white">{spec.name}</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {spec.standardsRef || '경찰규격'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 font-medium">시험 방법: </span>
                  <span>{spec.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">합격 기준: </span>
                  <span className="text-emerald-400 font-semibold">{spec.criteria}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">표본 추출: </span>
                  <span className="text-slate-400">{spec.sampleRatio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: 11 System Abnormal Items */}
      {activeTab === 'abnormal' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              경찰청 표준 시스템 이상상태 감지 규격 11종 (표 172)
            </h3>
            <p className="text-xs text-slate-400">
              무인단속장비가 자가진단하여 센터통신서버로 긴급 알림(OPCODE 0x31)을 송신해야 하는 장애 항목
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SYSTEM_ABNORMAL_ITEMS.map((item) => (
              <div
                key={item.no}
                className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    장애코드 #{item.no.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.appliesTo}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
