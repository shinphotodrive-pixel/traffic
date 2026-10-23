import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  FileCheck2,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { SYSTEM_ABNORMAL_ITEMS } from '../data/standardData';

type InspectionStage = 'initial' | 'periodic_1_2' | 'periodic_3_4' | 'periodic_5_plus';
type EquipmentType = 'fixed' | 'mobile' | 'vehicle' | 'drone';

export const PerformanceCalculator: React.FC = () => {
  // State for Inspection Mode
  const [stage, setStage] = useState<InspectionStage>('initial');
  const [equipType, setEquipType] = useState<EquipmentType>('fixed');

  // Input states
  const [speedRef, setSpeedRef] = useState<number>(80); // 기준장비 측정속도 (km/h)
  const [speedTarget, setSpeedTarget] = useState<number>(82); // 단속대상장비 측정속도 (km/h)
  const [speedLimit, setSpeedLimit] = useState<number>(70); // 제한속도 (km/h)

  const [totalPassVehicles, setTotalPassVehicles] = useState<number>(200); // 총 통과차량
  const [abnormalVehicles, setAbnormalVehicles] = useState<number>(4); // 비정상차량 (꺾인 번호판, 가려진 차량 등)
  const [targetVehicles, setTargetVehicles] = useState<number>(65); // 단속대상차량수 (기준속도 초과 등)
  const [detectedVehicles, setDetectedVehicles] = useState<number>(62); // 실제 단속 출력차량수
  const [recognizedPassVehicles, setRecognizedPassVehicles] = useState<number>(185); // 통과차량 번호판 인식 차량수
  const [misidentifiedPlates, setMisidentifiedPlates] = useState<number>(1); // 번호판 오인식 차량수

  // Specialized violation inputs
  const [signalErrors, setSignalErrors] = useState<number>(0); // 신호 오단속 수 (단속대상이 아닌데 단속)
  const [laneErrors, setLaneErrors] = useState<number>(0); // 차로/통행/진로/보도 오단속 수
  const [misclassifiedViolations, setMisclassifiedViolations] = useState<number>(2); // 위반행위 오구분 수 (신호->과속 등)

  // Helmet inputs
  const [totalMotorcycles, setTotalMotorcycles] = useState<number>(20); // 인식된 총 이륜차
  const [helmetErrors, setHelmetErrors] = useState<number>(1); // 안전모 착용 오판별 수

  // System abnormal checklist flags (item numbers)
  const [activeAbnormalItems, setActiveAbnormalItems] = useState<number[]>([]);

  // Calculations
  // 1. Speed accuracy
  const speedDiff = speedTarget - speedRef;
  const speedErrorRate = speedRef > 0 ? (speedDiff / speedRef) * 100 : 0;
  
  // Speed threshold based on speedRef:
  // <60: ±3km/h, 60~80: ±4km/h, 80~100: ±5km/h, >=100: ±5%
  let speedAllowedDesc = '';
  let isSpeedPassed = false;
  if (speedRef < 60) {
    speedAllowedDesc = '±3.0 km/h 이하';
    isSpeedPassed = Math.abs(speedDiff) <= 3.0;
  } else if (speedRef < 80) {
    speedAllowedDesc = '±4.0 km/h 이하';
    isSpeedPassed = Math.abs(speedDiff) <= 4.0;
  } else if (speedRef < 100) {
    speedAllowedDesc = '±5.0 km/h 이하';
    isSpeedPassed = Math.abs(speedDiff) <= 5.0;
  } else {
    speedAllowedDesc = '±5.0 % 이하';
    isSpeedPassed = Math.abs(speedErrorRate) <= 5.0;
  }

  // 2. Detection Rate
  const validTargetVehicles = Math.max(1, targetVehicles - abnormalVehicles);
  const rawDetectionRate = (detectedVehicles / validTargetVehicles) * 100;
  // 소수점 둘째자리에서 버림
  const detectionRate = Math.floor(rawDetectionRate * 10) / 10;

  // Thresholds for Detection Rate:
  // Initial: 80%, Periodic: 1-2yr: 75%, 3-4yr: 70%, 5yr+: 65%
  const detectionThreshold =
    stage === 'initial' ? 80.0 : stage === 'periodic_1_2' ? 75.0 : stage === 'periodic_3_4' ? 70.0 : 65.0;
  const isDetectionPassed = detectionRate >= detectionThreshold;

  // 3. Passing plate recognition rate
  const validPassVehicles = Math.max(1, totalPassVehicles - abnormalVehicles);
  const rawPlateRecogRate = (recognizedPassVehicles / validPassVehicles) * 100;
  const plateRecogRate = Math.floor(rawPlateRecogRate * 10) / 10;
  const plateRecogThreshold =
    stage === 'initial' ? 85.0 : stage === 'periodic_1_2' ? 80.0 : stage === 'periodic_3_4' ? 75.0 : 70.0;
  const isPlateRecogPassed = plateRecogRate >= plateRecogThreshold;

  // 4. Plate misidentification rate (for detected vehicles)
  const rawPlateErrorRate = detectedVehicles > 0 ? (misidentifiedPlates / detectedVehicles) * 100 : 0;
  const plateErrorRate = Math.floor(rawPlateErrorRate * 10) / 10;
  const plateErrorThreshold = equipType === 'fixed' ? 2.0 : equipType === 'drone' ? 10.0 : 5.0;
  const isPlateErrorPassed = plateErrorRate < plateErrorThreshold;

  // 5. Signal error rate (must be strictly 0%)
  const isSignalPassed = signalErrors === 0;
  const isLanePassed = laneErrors === 0;

  // 6. Classification rate
  const validClassificationDenom = Math.max(1, detectedVehicles - signalErrors);
  const rawClassificationRate = (1 - misclassifiedViolations / validClassificationDenom) * 100;
  const classificationRate = Math.floor(rawClassificationRate * 10) / 10;
  const isClassificationPassed = classificationRate >= 90.0;

  // 7. Helmet recognition rate
  const rawHelmetRate = totalMotorcycles > 0 ? (1 - helmetErrors / totalMotorcycles) * 100 : 100;
  const helmetRate = Math.floor(rawHelmetRate * 10) / 10;
  const helmetThreshold =
    stage === 'initial' ? 80.0 : stage === 'periodic_1_2' ? 75.0 : stage === 'periodic_3_4' ? 70.0 : 65.0;
  const isHelmetPassed = helmetRate >= helmetThreshold;

  // Overall Verdict
  const hasSystemAbnormal = activeAbnormalItems.length > 0;
  const isOverallPassed =
    isSpeedPassed &&
    isDetectionPassed &&
    isPlateRecogPassed &&
    isPlateErrorPassed &&
    isSignalPassed &&
    isLanePassed &&
    isClassificationPassed &&
    isHelmetPassed &&
    !hasSystemAbnormal;

  // Load Presets
  const loadGoodPreset = () => {
    setSpeedRef(80);
    setSpeedTarget(81.8);
    setTotalPassVehicles(250);
    setAbnormalVehicles(5);
    setTargetVehicles(70);
    setDetectedVehicles(66); // 66 / 65 = >100% -> 95%
    setRecognizedPassVehicles(228);
    setMisidentifiedPlates(1);
    setSignalErrors(0);
    setLaneErrors(0);
    setMisclassifiedViolations(2);
    setTotalMotorcycles(25);
    setHelmetErrors(2);
    setActiveAbnormalItems([]);
  };

  const loadFailPreset = () => {
    setSpeedRef(80);
    setSpeedTarget(86.5); // +6.5km/h error (> ±5km/h FAIL)
    setTotalPassVehicles(200);
    setAbnormalVehicles(5);
    setTargetVehicles(70);
    setDetectedVehicles(45); // ~69% (FAIL)
    setRecognizedPassVehicles(150); // 76.9% (FAIL)
    setMisidentifiedPlates(3);
    setSignalErrors(1); // Signal error > 0 (Strict FAIL)
    setLaneErrors(0);
    setMisclassifiedViolations(12);
    setTotalMotorcycles(20);
    setHelmetErrors(6);
    setActiveAbnormalItems([1, 8]);
  };

  const toggleAbnormalItem = (no: number) => {
    setActiveAbnormalItems((prev) =>
      prev.includes(no) ? prev.filter((i) => i !== no) : [...prev, no]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <span>제Ⅳ장 무인교통단속장비 성능검사</span>
            <span>·</span>
            <span>1.2 산출식 및 판정기준 요약표</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            성능검사 판정 계산기 & 적합성 시뮬레이터
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            한국도로교통공단 및 KOLAS 공인기관 검사기준(인수검사 및 1~5년차 정기검사)에 따른 실시간 산출 및 합격 판정
          </p>
        </div>

        {/* Preset Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadGoodPreset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>정상 합격 샘플</span>
          </button>
          <button
            onClick={loadFailPreset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>오류 불합격 샘플</span>
          </button>
        </div>
      </div>

      {/* Stage & Equipment Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inspection Stage */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              검사 단계 (정기검사 시 연차별 5%씩 기준 감액 적용)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'initial', label: '인수검사 (납품시)', sub: '단속률 ≥80%' },
                { id: 'periodic_1_2', label: '정기 1~2년차', sub: '단속률 ≥75%' },
                { id: 'periodic_3_4', label: '정기 3~4년차', sub: '단속률 ≥70%' },
                { id: 'periodic_5_plus', label: '정기 5년차 이상', sub: '단속률 ≥65%' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    stage === s.id
                      ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs block font-bold leading-tight">{s.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${stage === s.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {s.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              검사 대상 장비 분류
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fixed', label: '고정식', err: '오류율 <2%' },
                { id: 'mobile', label: '이동식', err: '오류율 <5%' },
                { id: 'vehicle', label: '차량탑재형', err: '오류율 <5%' },
                { id: 'drone', label: '드론탑재형', err: '오류율 <10%' },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEquipType(e.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    equipType === e.id
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs block font-bold leading-tight">{e.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${equipType === e.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {e.err}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Computed Metrics & Result Verdict on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Left: Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Speed Measurement Data */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span>1. 속도 측정 데이터 (검사장비 vs 대상장비)</span>
              <span className="text-xs text-slate-400 font-mono">단위: km/h</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">법정 제한속도</label>
                <input
                  type="number"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">검사장비 기준속도</label>
                <input
                  type="number"
                  step="0.1"
                  value={speedRef}
                  onChange={(e) => setSpeedRef(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-blue-700 focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">대상장비 측정속도</label>
                <input
                  type="number"
                  step="0.1"
                  value={speedTarget}
                  onChange={(e) => setSpeedTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              ※ 산출식: 속도오차 = 대상속도 - 기준속도 | 속도오차율(%) = ((대상 - 기준) / 기준) × 100
            </p>
          </div>

          {/* Card 2: Vehicle Counts & Detection Sampling */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span>2. 통과 및 단속 차량 계수 데이터 (최소 60대 이상)</span>
              <span className="text-xs text-slate-400 font-mono">단위: 대</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">총 통과 차량수</label>
                <input
                  type="number"
                  value={totalPassVehicles}
                  onChange={(e) => setTotalPassVehicles(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">비정상 차량수 (제외)</label>
                <input
                  type="number"
                  value={abnormalVehicles}
                  onChange={(e) => setAbnormalVehicles(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">단속 대상 차량수</label>
                <input
                  type="number"
                  value={targetVehicles}
                  onChange={(e) => setTargetVehicles(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-blue-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">단속 출력 차량수</label>
                <input
                  type="number"
                  value={detectedVehicles}
                  onChange={(e) => setDetectedVehicles(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-emerald-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">통과 인식 차량수</label>
                <input
                  type="number"
                  value={recognizedPassVehicles}
                  onChange={(e) => setRecognizedPassVehicles(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">번호판 오인식수</label>
                <input
                  type="number"
                  value={misidentifiedPlates}
                  onChange={(e) => setMisidentifiedPlates(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-rose-700 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Specific Violation Errors (Signals, Classification, Helmets) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              3. 특수 단속오류 및 안전모 판별 데이터
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold text-rose-700">
                  신호 오단속수 (0건 필수)
                </label>
                <input
                  type="number"
                  value={signalErrors}
                  onChange={(e) => setSignalErrors(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-rose-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold text-rose-700">
                  차로/보도 오단속수
                </label>
                <input
                  type="number"
                  value={laneErrors}
                  onChange={(e) => setLaneErrors(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-rose-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  위반 오구분 차량수
                </label>
                <input
                  type="number"
                  value={misclassifiedViolations}
                  onChange={(e) => setMisclassifiedViolations(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  안전모 오인식수 (이륜)
                </label>
                <input
                  type="number"
                  value={helmetErrors}
                  onChange={(e) => setHelmetErrors(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
              <span className="font-semibold text-slate-700">이륜차 총 통과: {totalMotorcycles}대</span>
              <span>·</span>
              <span>신호위반 오단속 오류율은 법적 무결성을 위해 0% 필수 충족</span>
            </div>
          </div>

          {/* Card 4: System Abnormal Check (표 159) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  4. 시스템 비정상 불합격 11개 조항 검사 (표 159)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  1개 조항이라도 체크 시 성능 수치와 무관하게 즉시 불합격 처리됩니다.
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  hasSystemAbnormal
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeAbnormalItems.length}건 감지
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {SYSTEM_ABNORMAL_ITEMS.map((item) => {
                const isChecked = activeAbnormalItems.includes(item.no);
                return (
                  <label
                    key={item.no}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAbnormalItem(item.no)}
                      className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-bold">
                        {item.no}. {item.title}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Real-time Metrics & Decision Board (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          {/* Main Pass/Fail Verdict Card */}
          <div
            className={`rounded-xl border p-6 shadow-sm transition-all ${
              isOverallPassed
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-rose-950 text-white border-rose-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-mono opacity-80">
                FINAL VERDICT · 종합 검사 판정
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/20">
                {stage === 'initial' ? '인수검사' : '정기검사'}
              </span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isOverallPassed ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isOverallPassed ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {isOverallPassed ? '합 격 (PASS)' : '불합격 (FAIL)'}
                </div>
                <p className="text-xs opacity-90 mt-1">
                  {isOverallPassed
                    ? '모든 규격서 성능기준 및 시스템 무결성 기준을 통과하였습니다.'
                    : hasSystemAbnormal
                    ? '시스템 비정상 항목 감지로 인한 즉시 불합격 처리.'
                    : '일부 검사항목의 성능기준이 허용오차를 초과하였습니다.'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span>장비분류: {equipType.toUpperCase()}</span>
              <span>KPS-08-0004-02 규격 기준</span>
            </div>
          </div>

          {/* Itemized Compliance Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                세부 성능 산출값 및 합격기준 비교
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">실시간 계산</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Speed Accuracy */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">속도 정확도 (오차)</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    기준 {speedRef} vs 대상 {speedTarget} (허용: {speedAllowedDesc})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {speedDiff >= 0 ? `+${speedDiff.toFixed(1)}` : speedDiff.toFixed(1)} km/h
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({speedErrorRate.toFixed(1)}%)
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isSpeedPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isSpeedPassed ? '합격' : '기준미달'}
                  </span>
                </div>
              </div>

              {/* Violation Detection Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">위반차량 단속률</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {detectedVehicles} / ({targetVehicles} - {abnormalVehicles}) (기준 ≥{detectionThreshold}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {detectionRate.toFixed(1)} %
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isDetectionPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isDetectionPassed ? '합격' : '기준미달'}
                  </span>
                </div>
              </div>

              {/* Passing Vehicle Plate Recognition Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">통과차량 번호인식률</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {recognizedPassVehicles} / ({totalPassVehicles} - {abnormalVehicles}) (기준 ≥{plateRecogThreshold}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {plateRecogRate.toFixed(1)} %
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isPlateRecogPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isPlateRecogPassed ? '합격' : '기준미달'}
                  </span>
                </div>
              </div>

              {/* Plate Misidentification Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">차량번호인식 오류율</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {misidentifiedPlates} / {detectedVehicles} (기준 &lt;{plateErrorThreshold}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {plateErrorRate.toFixed(1)} %
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isPlateErrorPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isPlateErrorPassed ? '합격' : '기준초과'}
                  </span>
                </div>
              </div>

              {/* Signal & Lane Error Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">신호위반 단속 오류율</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    오단속: {signalErrors}건 (기준: 0% 필수)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {signalErrors === 0 ? '0 %' : `${((signalErrors / detectedVehicles) * 100).toFixed(1)} %`}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isSignalPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isSignalPassed ? '0% 만족' : '즉시 불합격'}
                  </span>
                </div>
              </div>

              {/* Violation Classification Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">위반행위 구분률</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    오구분: {misclassifiedViolations}대 (기준 ≥90%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {classificationRate.toFixed(1)} %
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isClassificationPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isClassificationPassed ? '합격' : '기준미달'}
                  </span>
                </div>
              </div>

              {/* Helmet Recognition Rate */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">안전모 구분율 (이륜차)</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    오판별: {helmetErrors}대 / 총 {totalMotorcycles}대 (기준 ≥{helmetThreshold}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {helmetRate.toFixed(1)} %
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isHelmetPassed ? 'text-emerald-600' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {isHelmetPassed ? '합격' : '기준미달'}
                  </span>
                </div>
              </div>

              {/* System Abnormal Indicator */}
              <div className="p-3.5 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-900 block">시스템 건전성 (11개 조항)</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeAbnormalItems.length === 0 ? '비정상 항목 없음' : `${activeAbnormalItems.length}개 비정상 항목 감지`}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[11px] font-bold ${
                      !hasSystemAbnormal ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {!hasSystemAbnormal ? '정상 (PASS)' : '비정상 (FAIL)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
