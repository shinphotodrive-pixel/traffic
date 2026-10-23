import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Sliders,
  CheckCircle2,
  Info,
  Car,
  Shield,
  Layers,
  ZoomIn
} from 'lucide-react';
import { SIGNAGE_DISTANCE_RULES } from '../data/standardData';

export const SignageGuide: React.FC = () => {
  const [selectedRoad, setSelectedRoad] = useState<number>(0);
  const [selectedSignType, setSelectedSignType] = useState<
    'front' | 'rear' | 'mobile' | 'time_based' | 'section' | 'auxiliary'
  >('rear');

  const curRoad = SIGNAGE_DISTANCE_RULES[selectedRoad];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <span>별표 2 교통단속표지의 규격 및 설치방법</span>
          <span>·</span>
          <span>도로교통법 시행규칙 및 교통안전표지 설치·관리 업무편람</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          교통단속표지 규격 & 설치거리 가이드
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          도로 종류 및 속도별 1차·2차 예고표지 설치거리 산출식과 표준 표지판(전면/후면/이동식/시간제/구간) 그래픽스 규격
        </p>
      </div>

      {/* Road Speed & Distance Calculator (<표 200p>) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              도로 등급 및 제한속도별 1차·2차 예고표지 설치위치 기준
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              단속지점 또는 구간에 대한 예고와 주의환기를 위해 사전에 1차, 2차 예고표지를 설치해야 합니다.
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-semibold">
            시인성 확보 ±50m 증감 가능
          </span>
        </div>

        {/* Road Type Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {SIGNAGE_DISTANCE_RULES.map((rule, idx) => {
            const isSelected = selectedRoad === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedRoad(idx)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block opacity-75">
                  {rule.speedLimit}
                </span>
                <span className="text-xs font-bold block mt-0.5 truncate leading-tight">
                  {rule.roadType.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Road Distance Visualization Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-900">{curRoad.roadType}</span>
              <span className="text-xs text-slate-500 ml-2">설치 위치 상세 규격</span>
            </div>
            <span className="text-xs font-mono text-blue-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
              {curRoad.note}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <span className="text-slate-400 font-semibold block mb-1">1차 예고표지 설치 위치</span>
              <div className="text-2xl font-extrabold font-mono text-blue-700">
                {curRoad.firstNoticeDist}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">단속 지점 전방 사전 예고 (시인성 확보)</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <span className="text-slate-400 font-semibold block mb-1">2차 예고표지 설치 위치</span>
              <div className="text-2xl font-extrabold font-mono text-amber-700">
                {curRoad.secondNoticeDist}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">단속 카메라 직전 최종 감속 유도</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <span className="text-slate-400 font-semibold block mb-1">단속 장비 설치 지점</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                0 m (단속지점)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">카메라 지주 또는 부스 거치 위치</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Signboard Showcase with Authentic Police Standard Graphics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              경찰청 표준 교통단속 표지판 그래픽스 규격
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              서체: 고딕체 / 색채: 황색(색번호 13538, #FFCA08), 흑색(색번호 17038, #18181B)
            </p>
          </div>

          {/* Sign Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto">
            {[
              { id: 'rear', label: '후면번호판 단속' },
              { id: 'front', label: '전면 단속중' },
              { id: 'mobile', label: '이동식 단속구간' },
              { id: 'time_based', label: '시간제 속도제한' },
              { id: 'section', label: '구간단속 안내' },
              { id: 'auxiliary', label: '보조표지판' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedSignType(st.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedSignType === st.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display of Authentic Korean Signboards */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-100/60 rounded-xl border border-dashed border-slate-300">
          {/* Sign Type: Rear Plate */}
          {selectedSignType === 'rear' && (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Basic 1.0x */}
              <div className="flex flex-col items-center">
                <div className="w-[180px] bg-[#FFCA08] border-4 border-black rounded-2xl p-4 text-black text-center shadow-md">
                  {/* Camera icon glyph */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-16 h-8 bg-black rounded flex items-center justify-center gap-1 relative">
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-black" />
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-black" />
                      <div className="absolute -right-2 top-1.5 w-2 h-5 bg-black rounded-r" />
                    </div>
                  </div>
                  <div className="font-extrabold text-sm tracking-tight border-b-2 border-black pb-1 mb-1">
                    후면번호판
                  </div>
                  <div className="text-xl font-black tracking-wider leading-none mb-1">
                    단 속 중
                  </div>
                  <div className="text-[10px] font-bold font-sans tracking-tight">
                    Photo enforcement
                  </div>
                  <div className="mt-2 pt-2 border-t-2 border-black font-extrabold text-lg">
                    600 m
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono mt-2">
                  기본형 1.0배 (70 × 110 cm)
                </span>
              </div>

              {/* Highway Expanded 1.5x */}
              <div className="flex flex-col items-center">
                <div className="w-[240px] bg-[#FFCA08] border-[5px] border-black rounded-2xl p-5 text-black text-center shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-20 h-10 bg-black rounded flex items-center justify-center gap-1.5 relative">
                      <div className="w-4 h-4 rounded-full bg-white border border-black" />
                      <div className="w-4 h-4 rounded-full bg-white border border-black" />
                      <div className="absolute -right-2.5 top-2 w-2.5 h-6 bg-black rounded-r" />
                    </div>
                  </div>
                  <div className="font-extrabold text-base tracking-tight border-b-2 border-black pb-1 mb-1">
                    후면번호판
                  </div>
                  <div className="text-2xl font-black tracking-wider leading-none mb-1">
                    단 속 중
                  </div>
                  <div className="text-xs font-bold font-sans tracking-tight">
                    Photo enforcement
                  </div>
                  <div className="mt-2 pt-2 border-t-2 border-black font-extrabold text-xl">
                    600 m
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono mt-2">
                  고속도로 확대형 1.5배 (105 × 165 cm)
                </span>
              </div>
            </div>
          )}

          {/* Sign Type: Front Detection */}
          {selectedSignType === 'front' && (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-[180px] bg-[#FFCA08] border-4 border-black rounded-2xl p-4 text-black text-center shadow-md">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-16 h-8 bg-black rounded flex items-center justify-center gap-1 relative">
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                      <div className="absolute -right-2 top-1.5 w-2 h-5 bg-black rounded-r" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-wider leading-none my-2">
                    단 속 중
                  </div>
                  <div className="text-[10px] font-bold font-sans tracking-tight">
                    Photo enforcement
                  </div>
                  <div className="mt-3 pt-2 border-t-2 border-black font-extrabold text-lg">
                    600 m
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono mt-2">
                  기본형 1.0배 (70 × 110 cm)
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-[240px] bg-[#FFCA08] border-[5px] border-black rounded-2xl p-5 text-black text-center shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-20 h-10 bg-black rounded flex items-center justify-center gap-1.5 relative">
                      <div className="w-4 h-4 rounded-full bg-white" />
                      <div className="w-4 h-4 rounded-full bg-white" />
                      <div className="absolute -right-2.5 top-2 w-2.5 h-6 bg-black rounded-r" />
                    </div>
                  </div>
                  <div className="text-3xl font-black tracking-wider leading-none my-2">
                    단 속 중
                  </div>
                  <div className="text-xs font-bold font-sans tracking-tight">
                    Photo enforcement
                  </div>
                  <div className="mt-3 pt-2 border-t-2 border-black font-extrabold text-xl">
                    600 m
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono mt-2">
                  확대형 1.5배 (105 × 165 cm)
                </span>
              </div>
            </div>
          )}

          {/* Sign Type: Mobile */}
          {selectedSignType === 'mobile' && (
            <div className="flex flex-col items-center">
              <div className="w-[200px] bg-[#FFCA08] border-4 border-black rounded-2xl p-4 text-black text-center shadow-md">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-16 h-8 bg-black rounded flex items-center justify-center gap-1 relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    <div className="absolute -right-2 top-1.5 w-2 h-5 bg-black rounded-r" />
                  </div>
                </div>
                <div className="text-xl font-black tracking-tight leading-snug my-1">
                  이 동 식<br />단 속 구 간
                </div>
                <div className="text-[10px] font-bold font-sans tracking-tight">
                  Photo enforcement
                </div>
                <div className="mt-3 pt-2 border-t-2 border-black font-extrabold text-base">
                  안 전 운 전
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono mt-2">
                이동식 교통단속예고표지 (기본형 1.0배)
              </span>
            </div>
          )}

          {/* Sign Type: Time-based Variable */}
          {selectedSignType === 'time_based' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
                {/* 30 km/h day */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-8 border-rose-600 bg-white flex items-center justify-center text-3xl font-black text-black">
                    30
                  </div>
                  <span className="text-xs font-mono font-bold mt-2 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    07:00 ~ 21:00
                  </span>
                </div>

                {/* 50 km/h night */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-8 border-rose-600 bg-white flex items-center justify-center text-3xl font-black text-black">
                    50
                  </div>
                  <span className="text-xs font-mono font-bold mt-2 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    21:00 ~ 07:00
                  </span>
                </div>

                {/* Electronic LED Display */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-black border-4 border-slate-700 flex items-center justify-center text-3xl font-black text-emerald-400 font-mono shadow-inner">
                    50
                  </div>
                  <span className="text-xs font-bold mt-2 text-blue-700">가변형 LED 전광판</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                시간제 속도운영 구간내 최고제한속도 표지 규격 (스쿨존 야간 탄력 운영)
              </span>
            </div>
          )}

          {/* Sign Type: Section Enforcement */}
          {selectedSignType === 'section' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-[300px] bg-[#E87722] border-4 border-black rounded-xl p-4 text-black text-center shadow-md">
                <div className="text-xl font-black tracking-wider leading-none mb-1">
                  지점·연속구간단속
                </div>
                <div className="text-xs font-bold font-mono mt-2 bg-black/10 py-1 rounded">
                  총단속거리 : 30km<br />1구간 단속거리 : 10km
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                다중(연속) 구간속도위반 단속장비 예고·안내 표지판 (지점단속 병행 표기)
              </span>
            </div>
          )}

          {/* Sign Type: Auxiliary Sub-signs */}
          {selectedSignType === 'auxiliary' && (
            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="bg-[#FFCA08] border-2 border-black rounded-lg py-2.5 px-4 text-center font-black text-base tracking-wider text-black shadow-xs">
                과 속 단 속 장 비
              </div>
              <div className="bg-[#FFCA08] border-2 border-black rounded-lg py-2.5 px-4 text-center font-black text-base tracking-wider text-black shadow-xs">
                신 호 · 과 속 단 속 장 비
              </div>
              <div className="bg-[#FFCA08] border-2 border-black rounded-lg py-2.5 px-4 text-center font-black text-base tracking-wider text-black shadow-xs">
                후 면 번 호 판 단 속 중
              </div>
              <div className="bg-[#FFCA08] border-2 border-black rounded-lg py-2.5 px-4 text-center font-black text-base tracking-wider text-black shadow-xs">
                신호 · 과속 · 안전모 · 꼬리물기 후면단속
              </div>
              <span className="text-xs text-slate-500 font-mono text-center mt-1">
                교통단속 보조표지 (단속카메라 지주 등 부착 규격, 가로 1000~1670mm × 세로 280~500mm)
              </span>
            </div>
          )}
        </div>

        {/* Structural Spec Note Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">판의 재질 및 두께</span>
            <p>알루미늄판 2.0mm 또는 FRP(유리섬유강화플라스틱) 3.0mm</p>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">설치 높이 기준</span>
            <p>정주식 200~210cm / 문형식 및 내민식 지주 450cm 이상</p>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">글자 타이포그래피</span>
            <p>고딕체, 글자간격 0.5~1.0칸, 획 두께 15%, 장평 70~90%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
