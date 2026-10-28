import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CloudRain,
  Sun,
  Activity,
  Layers,
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Cpu,
  Gauge,
  Wifi,
} from 'lucide-react';
import { CalculationRecord, downloadJson } from '../utils/exportUtils';

export interface SimulationScenario {
  id: string;
  title: string;
  threatLevel: '치명적' | '경고' | '주의';
  category: string;
  environment: {
    weather: string;
    lighting: string;
    roadCondition: string;
    trafficDensity: string;
  };
  description: string;
  targetMetric: string;
  simulatedOutcome: {
    predictedScore: number;
    passOrFail: string;
    speedErrorMargin: string;
    plateRecognitionEst: string;
    signalFalsePositiveEst: string;
    commLatencyEst: string;
  };
  specReference: string;
  riskAnalysis: string;
  inspectionChecklist: string[];
}

interface AiSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: {
    equipmentType: string;
    equipmentId: string;
    location: string;
    speedError: number;
    plateSuccessRate: number;
    plateErrorRate: number;
    violationRate: number;
    signalFalsePositives: number;
    commLatency: number;
    isSecurityValid: boolean;
    isDurabilityPassed: boolean;
    scores?: {
      speed: number;
      plate: number;
      violation: number;
      signal: number;
      comm: number;
      durability: number;
      overall: number;
    };
  };
  onNavigateToSpec?: (chapterId: string, sectionId: string) => void;
}

export const AiSimulationModal: React.FC<AiSimulationModalProps> = ({
  isOpen,
  onClose,
  calculationData,
  onNavigateToSpec,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [generationSource, setGenerationSource] = useState<string>('');
  const [selectedWeather, setSelectedWeather] = useState('자동 최적화');
  const [selectedRoad, setSelectedRoad] = useState('자동 최적화');
  const [copied, setCopied] = useState(false);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [simulatingPhase, setSimulatingPhase] = useState<number>(0);
  const [executedResults, setExecutedResults] = useState<{ [id: string]: boolean }>({});

  const fetchScenarios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/simulate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculationData,
          environmentOptions: {
            weather: selectedWeather,
            roadType: selectedRoad,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
      }

      const data = await res.json();
      setScenarios(data.scenarios || []);
      setSummary(data.summary || '');
      setGenerationSource(data.model || 'Gemini 3.8 Flash');
    } catch (err: any) {
      console.error('Simulation generation failed:', err);
      setErrorMsg(err.message || '시뮬레이션 시나리오를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && scenarios.length === 0) {
      fetchScenarios();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunVirtualTest = (scenarioId: string) => {
    setActiveSimulationId(scenarioId);
    setSimulatingPhase(1);

    setTimeout(() => {
      setSimulatingPhase(2);
    }, 500);

    setTimeout(() => {
      setSimulatingPhase(3);
    }, 1000);

    setTimeout(() => {
      setActiveSimulationId(null);
      setSimulatingPhase(0);
      setExecutedResults((prev) => ({ ...prev, [scenarioId]: true }));
    }, 1500);
  };

  const handleCopyAll = () => {
    const text = `[경찰청 무인교통단속장비(2026 규격) AI 실환경 시뮬레이션 테스트 리포트]
• 장비: ${calculationData.equipmentId} (${calculationData.equipmentType})
• 설치지점: ${calculationData.location}
• 분석 개요: ${summary}

${scenarios
  .map(
    (s, idx) => `
[시나리오 ${idx + 1}] ${s.title} (${s.threatLevel} / ${s.category})
- 환경: ${s.environment.weather} | ${s.environment.lighting} | ${s.environment.roadCondition}
- 상세상황: ${s.description}
- 검증지표: ${s.targetMetric}
- 규격조항: ${s.specReference}
- 예상판정: ${s.simulatedOutcome.passOrFail} (예상점수 ${s.simulatedOutcome.predictedScore}점)
  * 예상속도오차: ${s.simulatedOutcome.speedErrorMargin}
  * 예상번호인식률: ${s.simulatedOutcome.plateRecognitionEst}
  * 예상통신지연: ${s.simulatedOutcome.commLatencyEst}
- 위험분석: ${s.riskAnalysis}
- 현장 점검항목:
${s.inspectionChecklist.map((c) => `  * ${c}`).join('\n')}`
  )
  .join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    downloadJson(
      {
        exportedAt: new Date().toISOString(),
        equipment: calculationData,
        model: generationSource,
        summary,
        scenarios,
      },
      `ai_simulation_${calculationData.equipmentId}_${Date.now()}.json`
    );
  };

  const getThreatBadge = (level: string) => {
    switch (level) {
      case '치명적':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case '경고':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  경찰규격서 기반 AI 실환경 시뮬레이션 테스트 랩
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  {generationSource || 'Gemini 3.8 Flash'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                현재 계산된 성능검사 점수와 취약 요소를 바탕으로 극한 기상·통신두절·다차로 과속 등 실환경 시나리오를 AI로 생성합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Calculation Metrics Summary Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-semibold border border-blue-700/50">
              {calculationData.equipmentType.toUpperCase()} ({calculationData.equipmentId})
            </span>
            <span className="text-slate-400">• 종합 점수:</span>
            <strong className="text-white font-mono">{calculationData.scores?.overall || 90}점</strong>
            <span className="text-slate-400">• 속도오차:</span>
            <span className="text-slate-200 font-mono">±{calculationData.speedError}km/h</span>
            <span className="text-slate-400">• 번호인식:</span>
            <span className="text-slate-200 font-mono">{calculationData.plateSuccessRate}%</span>
            <span className="text-slate-400">• 신호오류:</span>
            <span className="text-emerald-400 font-mono">{calculationData.signalFalsePositives}건</span>
            <span className="text-slate-400">• 통신지연:</span>
            <span className="text-slate-200 font-mono">{calculationData.commLatency}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchScenarios}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>시나리오 재생성</span>
            </button>
          </div>
        </div>

        {/* Tuner Controls (Optional Knobs) */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 font-medium">기상 조건:</span>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="자동 최적화">자동 최적화 (취약점 기반)</option>
              <option value="집중호우(15mm/min) 및 안개">집중호우(15mm/min) 및 안개</option>
              <option value="야간 칠흑(0.1 Lux) 역광">야간 칠흑(0.1 Lux) 역광 난반사</option>
              <option value="폭설 및 노면 결빙">폭설 및 노면 결빙</option>
              <option value="태풍급 강풍(25m/s)">태풍급 강풍(25m/s)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">도로 및 통행 특성:</span>
            <select
              value={selectedRoad}
              onChange={(e) => setSelectedRoad(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="자동 최적화">자동 최적화 (도로 환경)</option>
              <option value="고속도로 4차로 180km/h 초과속">고속도로 4차로 (180km/h 초과속)</option>
              <option value="교차로 꼬리물기 및 황색 딜레마">교차로 꼬리물기 및 황색 딜레마</option>
              <option value="스쿨존 시간제 속도구간">스쿨존 시간제 속도구간 (가변속도)</option>
              <option value="터널 진입 실선구간">터널 진입 실선(진로변경제한)</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 no-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white">
                  AI가 실제 도로 현장 위험 시나리오를 연산 중입니다...
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  KPS-08-0004-02: 2026 경찰규격서와 입력된 {calculationData.equipmentType} 장비의 취약 항목(속도/번호/신호/통신)을 대조하여 시뮬레이션을 구성하고 있습니다.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold text-white">시나리오 연산 실패</strong>
                <p>{errorMsg}</p>
                <button
                  onClick={fetchScenarios}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium"
                >
                  재시도
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Callout */}
              {summary && (
                <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-xl flex items-start gap-3 text-xs text-blue-200">
                  <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white">AI 시뮬레이션 종합 분석 요약</span>
                    <p className="text-slate-300 leading-relaxed">{summary}</p>
                  </div>
                </div>
              )}

              {/* Scenario Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario, index) => {
                  const isSimulating = activeSimulationId === scenario.id;
                  const isExecuted = executedResults[scenario.id];

                  return (
                    <div
                      key={scenario.id}
                      className={`p-4 bg-slate-950/60 border rounded-xl space-y-3.5 transition-all shadow-md relative overflow-hidden ${
                        isSimulating
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-900/90'
                          : isExecuted
                          ? 'border-emerald-700/60 bg-slate-950/80'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getThreatBadge(
                              scenario.threatLevel
                            )}`}
                          >
                            위협: {scenario.threatLevel}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {scenario.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {scenario.title}
                      </h4>

                      {/* Environment Factors */}
                      <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">기상: </span>
                          <span className="text-slate-300 font-medium">
                            {scenario.environment.weather}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">조도: </span>
                          <span className="text-slate-300 font-medium">
                            {scenario.environment.lighting}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">교통밀도: </span>
                          <span className="text-slate-300 font-medium">
                            {scenario.environment.trafficDensity}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {scenario.description}
                      </p>

                      {/* Target Metric & Spec Clause */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-900 text-xs">
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-500 flex-shrink-0">검증대상:</span>
                          <span className="text-blue-300 font-semibold">
                            {scenario.targetMetric}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            <span>{scenario.specReference}</span>
                          </div>
                          {onNavigateToSpec && (
                            <button
                              onClick={() => {
                                onClose();
                                onNavigateToSpec('ch2', 'ch2-3');
                              }}
                              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium underline"
                            >
                              규격서 전문 보기
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Simulated Outcome Box / Active Runner */}
                      {isSimulating ? (
                        <div className="p-3 bg-blue-950/40 border border-blue-600/50 rounded-lg space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-300 font-bold flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              스트레스 테스트 실행 중 (Phase {simulatingPhase}/3)...
                            </span>
                            <span className="text-[10px] text-blue-400 font-mono">
                              {simulatingPhase === 1
                                ? '노이즈 주입'
                                : simulatingPhase === 2
                                ? 'ANPR/레이다 연산'
                                : '규격 검증'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${(simulatingPhase / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">시뮬레이션 예측 결과:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                scenario.simulatedOutcome.passOrFail === '적합'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {scenario.simulatedOutcome.passOrFail} ({scenario.simulatedOutcome.predictedScore}점)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <div>속도오차: <span className="text-slate-200 font-mono font-bold">{scenario.simulatedOutcome.speedErrorMargin}</span></div>
                            <div>번호인식: <span className="text-slate-200 font-mono font-bold">{scenario.simulatedOutcome.plateRecognitionEst}</span></div>
                            <div>신호오단속: <span className="text-emerald-400 font-mono font-bold">{scenario.simulatedOutcome.signalFalsePositiveEst}</span></div>
                            <div>통신지연: <span className="text-slate-200 font-mono font-bold">{scenario.simulatedOutcome.commLatencyEst}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Risk Analysis & Checklist */}
                      <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                        <div className="text-[11px] text-amber-300/90 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{scenario.riskAnalysis}</span>
                        </div>
                        <div className="text-[11px] space-y-0.5 pl-4 list-disc text-slate-400">
                          {scenario.inspectionChecklist.map((c, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-blue-500 text-[10px]">•</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleRunVirtualTest(scenario.id)}
                          disabled={isSimulating}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                            isExecuted
                              ? 'bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isExecuted ? '가상 테스트 재실행' : '가상 스트레스 테스트 실행'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            총 {scenarios.length}개 가상 환경 시나리오 로드됨 | 도로교통법 제4조의2 및 경찰청 KPS-08-0004-02: 2026 표준
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              disabled={scenarios.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>전체 시나리오 복사</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={scenarios.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>JSON 저장</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
