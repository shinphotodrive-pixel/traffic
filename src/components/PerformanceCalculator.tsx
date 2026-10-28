import React, { useState, useEffect } from 'react';
import { RadarComplianceChart } from './RadarComplianceChart';
import { RecentHistorySummaryCard } from './RecentHistorySummaryCard';
import { HistoryManagerModal } from './HistoryManagerModal';
import { OfficialReportModal } from './OfficialReportModal';
import { ShareInspectionModal } from './ShareInspectionModal';
import {
  CalculationRecord,
  downloadJson,
  exportElementToPdf,
} from '../utils/exportUtils';
import {
  Calculator,
  Save,
  FileCheck,
  Share2,
  Download,
  FolderOpen,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Cpu,
  Gauge,
  Camera,
  Layers,
  ThermometerSnowflake,
  Search,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { ClauseQuickSearch } from './ClauseQuickSearch';
import { AiSimulationModal } from './AiSimulationModal';

const LOCAL_STORAGE_KEY = 'npa_traffic_spec_calc_history';

interface PerformanceCalculatorProps {
  onNavigateToSpec?: (chapterId: string, sectionId: string) => void;
}

export const PerformanceCalculator: React.FC<PerformanceCalculatorProps> = ({ onNavigateToSpec }) => {
  // Metadata state
  const [equipmentType, setEquipmentType] = useState<'fixed' | 'mobile' | 'vehicle' | 'drone'>('fixed');
  const [equipmentId, setEquipmentId] = useState('02-SEO-1025');
  const [location, setLocation] = useState('서울특별시 서초구 반포대로 120 (대법원 앞)');
  const [inspector, setInspector] = useState('김검사 책임연구원');
  const [agency, setAgency] = useState('도로교통공단 교통안전인증처');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('2026년 표준 통신 프로토콜 및 가변속도 분리단속 알고리즘 적용 시험');

  // Performance inputs
  // 1. Speed test
  const [refSpeed, setRefSpeed] = useState<number>(100);
  const [measuredSpeed, setMeasuredSpeed] = useState<number>(101.8);

  // 2. Plate recognition
  const [plateTotalCount, setPlateTotalCount] = useState<number>(100);
  const [plateSuccessCount, setPlateSuccessCount] = useState<number>(98);
  const [plateErrorCount, setPlateErrorCount] = useState<number>(1);

  // 3. Enforcement capture
  const [violationSimulated, setViolationSimulated] = useState<number>(50);
  const [violationCaptured, setViolationCaptured] = useState<number>(47);

  // 4. Signal false positive
  const [signalTests, setSignalTests] = useState<number>(30);
  const [signalFalsePositives, setSignalFalsePositives] = useState<number>(0);

  // 5. Comm latency
  const [commLatency, setCommLatency] = useState<number>(145);
  const [isSecurityValid, setIsSecurityValid] = useState<boolean>(true);

  // 6. Chamber & Durability
  const [isDurabilityPassed, setIsDurabilityPassed] = useState<boolean>(true);

  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // History state
  const [history, setHistory] = useState<CalculationRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Sync history to localStorage
  const saveHistoryToStorage = (newHistory: CalculationRecord[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  // Calculations according to KPS-08-0004-02:2026
  // Speed error %
  const speedDiff = Math.abs(measuredSpeed - refSpeed);
  const speedErrorRate = (speedDiff / (refSpeed || 1)) * 100;
  // Standard: <60km/h => within +-3km/h, >=60km/h => within +-5%
  const isSpeedPass = refSpeed < 60 ? speedDiff <= 3.0 : speedErrorRate <= 5.0;
  const speedScore = isSpeedPass
    ? Math.max(80, Math.min(100, Math.round(100 - speedErrorRate * 4)))
    : Math.max(30, Math.round(70 - speedErrorRate * 5));

  // Plate recognition rate %
  const plateRecognitionRate = plateTotalCount > 0 ? (plateSuccessCount / plateTotalCount) * 100 : 0;
  const plateErrorRate = plateTotalCount > 0 ? (plateErrorCount / plateTotalCount) * 100 : 0;
  // Standard: rate >= 85%, error rate < 2.0%
  const isPlatePass = plateRecognitionRate >= 85.0 && plateErrorRate < 2.0;
  const plateScore = isPlatePass
    ? Math.max(80, Math.min(100, Math.round(plateRecognitionRate)))
    : Math.max(40, Math.round(plateRecognitionRate * 0.7));

  // Enforcement capture rate %
  const captureRate = violationSimulated > 0 ? (violationCaptured / violationSimulated) * 100 : 0;
  // Standard: capture rate >= 80% & signal false positive == 0
  const isCapturePass = captureRate >= 80.0 && signalFalsePositives === 0;
  const captureScore = isCapturePass
    ? Math.max(80, Math.min(100, Math.round(captureRate)))
    : Math.max(30, Math.round(captureRate * 0.7 - signalFalsePositives * 15));

  // Comm protocol score
  // Standard: latency < 1000ms
  const isCommPass = commLatency <= 1000;
  const commScore = isCommPass
    ? Math.max(80, Math.min(100, Math.round(100 - (commLatency / 1000) * 18)))
    : 50;

  // Security score
  const securityScore = isSecurityValid ? 100 : 40;

  // Durability score
  const durabilityScore = isDurabilityPassed ? 100 : 50;

  // Overall Score & Pass Determination
  // Weighted: Speed 25%, Plate 25%, Capture 20%, Comm 10%, Security 10%, Durability 10%
  const overallScore =
    speedScore * 0.25 +
    plateScore * 0.25 +
    captureScore * 0.20 +
    commScore * 0.10 +
    securityScore * 0.10 +
    durabilityScore * 0.10;

  // Pass requires all critical items pass and overall score >= 80
  const isPassed =
    isSpeedPass &&
    isPlatePass &&
    isCapturePass &&
    isCommPass &&
    isSecurityValid &&
    isDurabilityPassed &&
    overallScore >= 80.0;

  const currentRecord: CalculationRecord = {
    id: `REC-${Date.now().toString(36)}`,
    savedAt: new Date().toISOString(),
    equipmentId,
    equipmentType,
    equipmentTypeName:
      equipmentType === 'fixed'
        ? '고정식 무인단속장비'
        : equipmentType === 'mobile'
        ? '이동식 무인단속장비'
        : equipmentType === 'vehicle'
        ? '차량탑재형 단속장비'
        : '드론(UAV) 단속장비',
    location,
    inspector,
    agency,
    date,
    overallScore,
    isPassed,
    metrics: {
      speedScore,
      speedErrorRate,
      plateScore,
      plateRecognitionRate,
      captureScore,
      captureRate,
      commScore,
      commLatency,
      securityScore,
      isSecurityValid,
      durabilityScore,
      isDurabilityPassed,
    },
    notes,
  };

  const handleSaveCalculation = () => {
    const updated = [currentRecord, ...history.filter((h) => h.equipmentId !== equipmentId || h.date !== date)];
    saveHistoryToStorage(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  const handleLoadRecord = (rec: CalculationRecord) => {
    setEquipmentType(rec.equipmentType);
    setEquipmentId(rec.equipmentId);
    setLocation(rec.location);
    setInspector(rec.inspector);
    setAgency(rec.agency);
    setDate(rec.date);
    if (rec.notes) setNotes(rec.notes);
    // set corresponding inputs approx
    setCommLatency(rec.metrics.commLatency);
    setIsSecurityValid(rec.metrics.isSecurityValid);
    setIsDurabilityPassed(rec.metrics.isDurabilityPassed);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = history.filter((r) => r.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleClearAllHistory = () => {
    saveHistoryToStorage([]);
  };

  const handleExportJson = () => {
    downloadJson(currentRecord, `성능검사결과_${equipmentId}_${date}.json`);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(
        'calculator-main-card',
        `경찰청_성능검사보고_${equipmentId}.pdf`,
        `경찰청 무인단속장비 성능검사 결과 - ${equipmentId}`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleResetInputs = () => {
    setRefSpeed(100);
    setMeasuredSpeed(100.5);
    setPlateTotalCount(100);
    setPlateSuccessCount(99);
    setPlateErrorCount(0);
    setViolationSimulated(50);
    setViolationCaptured(49);
    setSignalTests(30);
    setSignalFalsePositives(0);
    setCommLatency(120);
    setIsSecurityValid(true);
    setIsDurabilityPassed(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              무인교통단속장비 성능검사 판정 계산기
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                KPS-08-0004-02: 2026
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              도로교통법 제4조의2 규격에 따라 6대 핵심 성능 항목을 실시간 검증하고 판정 성적서를 생성합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSimulationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-900/40 border border-blue-400/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI 환경 시뮬레이션
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('clause-quick-search-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 text-xs font-semibold rounded-lg border border-blue-700/50 transition"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            규격 조항 검색
          </button>
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            이력 관리 ({history.length})
          </button>
          <button
            onClick={handleResetInputs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
          <button
            onClick={handleSaveCalculation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition"
          >
            <Save className="w-3.5 h-3.5" />
            결과 저장
          </button>
        </div>
      </div>

      {/* Real-Time Clause Search Bar for Specific Equipment */}
      <div id="clause-quick-search-section">
        <ClauseQuickSearch
          onNavigateToSpec={onNavigateToSpec}
          initialEquipment={equipmentType}
        />
      </div>

      {/* Save Success Toast */}
      {saveSuccessToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>성능검사 결과가 로컬 저장소에 안전하게 저장되었습니다.</strong> 하단 최근 5회차 요약 카드 및 이력 관리에서 확인하실 수 있습니다.
            </span>
          </div>
        </div>
      )}

      {/* Main Calculation Grid */}
      <div id="calculator-main-card" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Equipment Metadata */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              1. 검사 대상 장비 및 입회관 기본 제원
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">장비 구분</label>
                <select
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500"
                >
                  <option value="fixed">고정식 무인단속장비 (전/후면 통합형)</option>
                  <option value="mobile">이동식 무인단속장비 (레이저 삼각대)</option>
                  <option value="vehicle">차량탑재형 단속장비 (순찰차 부착)</option>
                  <option value="drone">드론(UAV) 단속장비 (고속도로 갓길/지정차로)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">장비 관리번호 (7자리)</label>
                <input
                  type="text"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">설치 위치 / 도로명</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">검사 기관</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">검사원 / 검사일자</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="검사원"
                    className="w-1/2 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Speed Accuracy Input */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                2. 속도 검지 정확도 측정 (기준: ±3km/h or ±5% 이내)
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isSpeedPass
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isSpeedPass ? '적합 (PASS)' : '오차 초과 (FAIL)'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">기준 교정속도 (km/h)</label>
                <input
                  type="number"
                  value={refSpeed}
                  onChange={(e) => setRefSpeed(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">장비 측정속도 (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measuredSpeed}
                  onChange={(e) => setMeasuredSpeed(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">산출 오차율</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {speedErrorRate.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  (편차 {speedDiff.toFixed(1)} km/h)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Plate Recognition Input */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                3. 번호판 인식률 및 오류율 (기준: 인식률 ≥85%, 오류율 &lt;2%)
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isPlatePass
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isPlatePass ? '적합 (PASS)' : '인식 기준 미달 (FAIL)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">총 주행차량</label>
                <input
                  type="number"
                  value={plateTotalCount}
                  onChange={(e) => setPlateTotalCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">정상 인식대수</label>
                <input
                  type="number"
                  value={plateSuccessCount}
                  onChange={(e) => setPlateSuccessCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">오인식 대수</label>
                <input
                  type="number"
                  value={plateErrorCount}
                  onChange={(e) => setPlateErrorCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">
                인식률: <strong className="text-white font-mono">{plateRecognitionRate.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-400">
                오류율: <strong className="text-white font-mono">{plateErrorRate.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-400">
                채점: <strong className="text-purple-400 font-mono">{plateScore}점</strong>
              </span>
            </div>
          </div>

          {/* Section 4: Enforcement Capture Rate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                4. 단속 검지율 & 신호위반 오단속 0건 검증
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isCapturePass
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isCapturePass ? '적합 (PASS)' : '오단속/검지 미달'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">위반 발생건</label>
                <input
                  type="number"
                  value={violationSimulated}
                  onChange={(e) => setViolationSimulated(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">단속 성공건</label>
                <input
                  type="number"
                  value={violationCaptured}
                  onChange={(e) => setViolationCaptured(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">신호 검사수</label>
                <input
                  type="number"
                  value={signalTests}
                  onChange={(e) => setSignalTests(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">신호 오단속</label>
                <input
                  type="number"
                  value={signalFalsePositives}
                  onChange={(e) => setSignalFalsePositives(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Protocol, Security & Chamber */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
              5. 프로토콜 응답성, SHA-256 무결성 & 환경시험
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">통신 응답지연 (ms)</label>
                <input
                  type="number"
                  value={commLatency}
                  onChange={(e) => setCommLatency(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">기준: 1,000ms 이하</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">SHA-256 무결성</label>
                <button
                  type="button"
                  onClick={() => setIsSecurityValid(!isSecurityValid)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    isSecurityValid
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isSecurityValid ? '✓ 위변조 해시 정상' : '✕ 해시 불일치'}
                </button>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">챔버 극한온도 & 방수</label>
                <button
                  type="button"
                  onClick={() => setIsDurabilityPassed(!isDurabilityPassed)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    isDurabilityPassed
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isDurabilityPassed ? '✓ 16시간 챔버 통과' : '✕ 환경시험 미달'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Score & Radar Chart & Action Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Verdict Card */}
          <div
            className={`rounded-2xl p-6 border shadow-2xl backdrop-blur-md transition ${
              isPassed
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-600/50'
                : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-600/50'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                경찰규격 최종 판정
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                }`}
              >
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    규격 적합 (합격)
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    규격 부적합 (불합격)
                  </>
                )}
              </span>
            </div>

            <div className="my-5 text-center">
              <div className="text-xs text-slate-400 font-medium">종합 환산 점수</div>
              <div className="text-5xl font-extrabold font-mono tracking-tight my-1 text-white">
                {overallScore.toFixed(1)}
                <span className="text-lg font-normal text-slate-500 ml-1">/ 100점</span>
              </div>
              <p className="text-xs text-slate-400">
                {isPassed
                  ? '도로교통법 제4조의2 및 경찰청 고시 전 항목 기준을 만족합니다.'
                  : '일부 평가 항목이 규격서 기준치에 미달하여 보완이 필요합니다.'}
              </p>
            </div>

            {/* Quick Export Actions */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                공식 성적서 생성
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                공유하기
              </button>
              <button
                onClick={handleExportJson}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                JSON 내보내기
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                {isExportingPdf ? 'PDF 변환중...' : 'PDF 내보내기'}
              </button>
            </div>

            {/* AI Simulation Test Scenarios Trigger Button */}
            <button
              onClick={() => setIsSimulationModalOpen(true)}
              className="w-full mt-3 py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/40 transition flex items-center justify-center gap-2 border border-blue-400/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI 실환경 시뮬레이션 시나리오 생성</span>
            </button>
          </div>

          {/* Radar Compliance Chart (Requirement 7) */}
          <RadarComplianceChart
            metrics={{
              speedScore,
              plateScore,
              captureScore,
              commScore,
              securityScore,
              durabilityScore,
            }}
            overallScore={overallScore}
            isPassed={isPassed}
          />
        </div>
      </div>

      {/* Bottom Summary Card (Requirement 8) */}
      <RecentHistorySummaryCard
        history={history}
        onLoadRecord={handleLoadRecord}
        onOpenFullHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Modals */}
      <HistoryManagerModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={history}
        onLoadRecord={handleLoadRecord}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllHistory}
      />

      <OfficialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        record={currentRecord}
      />

      <ShareInspectionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        record={currentRecord}
      />

      {/* AI Real-World Simulation Scenarios Modal */}
      <AiSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        calculationData={{
          equipmentType,
          equipmentId,
          location,
          speedError: Number((measuredSpeed - refSpeed).toFixed(1)),
          plateSuccessRate: Number(plateRecognitionRate.toFixed(1)),
          plateErrorRate: Number(plateErrorRate.toFixed(1)),
          violationRate: Number(captureRate.toFixed(1)),
          signalFalsePositives,
          commLatency,
          isSecurityValid,
          isDurabilityPassed,
          scores: {
            speed: speedScore,
            plate: plateScore,
            violation: captureScore,
            signal: signalFalsePositives === 0 ? 100 : 0,
            comm: commScore,
            durability: durabilityScore,
            overall: Number(overallScore.toFixed(1)),
          },
        }}
        onNavigateToSpec={onNavigateToSpec}
      />
    </div>
  );
};
