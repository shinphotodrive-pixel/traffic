import React, { useState } from 'react';
import { SIGNAGE_DISTANCE_RULES } from '../data/standardData';
import {
  Signpost,
  Navigation,
  MapPin,
  Car,
  ShieldAlert,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const SignageGuide: React.FC = () => {
  const [roadType, setRoadType] = useState<string>('고속국도');
  const [speedLimit, setSpeedLimit] = useState<number>(100);

  // Calculate recommended signage distance based on standard rules
  const getCalculatedDistance = (type: string, speed: number) => {
    if (type === '고속국도') {
      return {
        firstNotice: '단속 지점 전방 2km, 1km',
        secondNotice: '단속 지점 전방 500m (선택 권장)',
        minDistance: 1000,
        maxDistance: 2000,
        signType: '문형식 / 외팔보식 대형 표지판',
      };
    } else if (type === '일반국도' || type === '자동차전용도로') {
      if (speed >= 80) {
        return {
          firstNotice: '단속 지점 전방 500m',
          secondNotice: '단속 지점 전방 200m',
          minDistance: 200,
          maxDistance: 500,
          signType: '외팔보식 / 주주부착식 표준 표지판',
        };
      }
      return {
        firstNotice: '단속 지점 전방 300m',
        secondNotice: '단속 지점 전방 100m',
        minDistance: 100,
        maxDistance: 300,
        signType: '주주부착식 표준 표지판',
      };
    } else {
      // 특별시도/지방도/시군도
      if (speed <= 50) {
        return {
          firstNotice: '단속 지점 전방 100m ~ 200m',
          secondNotice: '단속 지점 전방 50m (도심부)',
          minDistance: 50,
          maxDistance: 200,
          signType: '주주부착식 소형 표지판',
        };
      }
      return {
        firstNotice: '단속 지점 전방 300m',
        secondNotice: '단속 지점 전방 100m',
        minDistance: 100,
        maxDistance: 300,
        signType: '주주부착식 표준 표지판',
      };
    }
  };

  const calculated = getCalculatedDistance(roadType, speedLimit);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Signpost className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              무인단속장비 사전 안내표지 설치기준
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                부록 2 & 시행규칙 제14조의2
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              도로 종류와 제한속도에 따른 법정 전방 사전 예고표지 설치 이격거리 및 디자인 규격
            </p>
          </div>
        </div>
      </div>

      {/* Calculator & Graphic Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Graphic (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            설치 도로 조건 입력 및 법정 거리 자동 산출
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">도로 유형 선택</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="고속국도">고속국도 (고속도로)</option>
                <option value="자동차전용도로">자동차전용도로</option>
                <option value="일반국도">일반국도 (국도)</option>
                <option value="특별시도/지방도">특별시도 / 지방도 / 시군도</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">
                구간 제한속도 ({speedLimit} km/h)
              </label>
              <input
                type="range"
                min={30}
                max={120}
                step={10}
                value={speedLimit}
                onChange={(e) => setSpeedLimit(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>30 (어린이보호)</span>
                <span>60 (도심부)</span>
                <span>80 (외곽)</span>
                <span>100~120 (고속)</span>
              </div>
            </div>
          </div>

          {/* Visual Road Simulation */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>도로 배치 시뮬레이션 ({roadType}, 제한속도 {speedLimit}km/h)</span>
              <span className="text-amber-400 font-mono text-[11px]">{calculated.signType}</span>
            </div>

            {/* Road graphic */}
            <div className="relative h-24 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between px-6 overflow-hidden">
              {/* Lane lines */}
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-700"></div>

              {/* Notice 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded bg-blue-600 border border-white flex flex-col items-center justify-center text-[8px] font-bold text-white shadow-lg text-center leading-none">
                  <span>단속중</span>
                  <span className="text-[7px] text-yellow-300 font-mono mt-0.5">{speedLimit}</span>
                </div>
                <span className="text-[9px] text-amber-300 font-mono mt-1">1차 표지</span>
              </div>

              {/* Distance arrow 1 */}
              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] font-mono text-slate-400 mb-0.5">
                  {calculated.firstNotice}
                </span>
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-rose-500 rotate-45"></div>
                </div>
              </div>

              {/* Notice 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded bg-yellow-400 border border-slate-900 flex flex-col items-center justify-center text-[7px] font-bold text-slate-900 shadow text-center leading-none">
                  <span>예고</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">2차 표지</span>
              </div>

              {/* Distance arrow 2 */}
              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] font-mono text-slate-400 mb-0.5">
                  {calculated.secondNotice}
                </span>
                <div className="w-full h-0.5 bg-gradient-to-r from-amber-500 to-rose-600 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-rose-600 rotate-45"></div>
                </div>
              </div>

              {/* Camera Icon */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-11 h-11 rounded-lg bg-rose-600/90 border border-rose-400 flex flex-col items-center justify-center text-white shadow-lg text-center leading-none">
                  <CameraIcon />
                  <span className="text-[7px] font-bold mt-0.5">단속장비</span>
                </div>
                <span className="text-[9px] text-rose-400 font-bold mt-1">단속 지점</span>
              </div>
            </div>

            {/* Calculated Values Table */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">제1 예고표지 설치거리</span>
                <strong className="text-sm font-mono text-white mt-0.5 block">
                  {calculated.firstNotice}
                </strong>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">제2 예고표지 (보조)</span>
                <strong className="text-sm font-mono text-white mt-0.5 block">
                  {calculated.secondNotice}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Reference Rules Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            경찰규격서 부록 2 표준 거리 기준표
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-2.5">도로구분</th>
                  <th className="py-2 px-2.5">제한속도</th>
                  <th className="py-2 px-2.5">1차 표지</th>
                  <th className="py-2 px-2.5">2차 표지</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {SIGNAGE_DISTANCE_RULES.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2.5 font-medium text-white">{rule.roadType}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-400">{rule.speedLimit}</td>
                    <td className="py-2 px-2.5 font-mono text-amber-300">{rule.firstNoticeDist}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-400">{rule.secondNoticeDist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 leading-relaxed">
            <p className="font-semibold text-slate-300">규격 유의사항:</p>
            <p>· 이동식 단속 부스 설치 시에도 표지판을 필히 전방에 거치해야 함.</p>
            <p>· 후면단속 장비는 이륜차 운전자가 인지할 수 있도록 보조안내 문구 병기 권장.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function CameraIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}
