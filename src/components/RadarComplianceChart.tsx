import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

interface RadarDataPoint {
  subject: string;
  measured: number;
  benchmark: number;
  fullMark: number;
  unit: string;
}

interface RadarComplianceChartProps {
  metrics: {
    speedScore: number;
    plateScore: number;
    captureScore: number;
    commScore: number;
    securityScore: number;
    durabilityScore: number;
  };
  overallScore: number;
  isPassed: boolean;
}

export const RadarComplianceChart: React.FC<RadarComplianceChartProps> = ({
  metrics,
  overallScore,
  isPassed,
}) => {
  const chartData: RadarDataPoint[] = [
    {
      subject: '속도 검지 정확도',
      measured: metrics.speedScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
    {
      subject: '번호판 인식률',
      measured: metrics.plateScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
    {
      subject: '위반단속 검지율',
      measured: metrics.captureScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
    {
      subject: '통신 프로토콜',
      measured: metrics.commScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
    {
      subject: '암호화 & 무결성',
      measured: metrics.securityScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
    {
      subject: '환경/내구성',
      measured: metrics.durabilityScore,
      benchmark: 80,
      fullMark: 100,
      unit: '점',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h4 className="text-sm font-bold text-white tracking-wide">
              6대 핵심 규격 충족도 레이더 차트
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            KPS-08-0004-02:2026 기준 최소 적격 기준선(80점) 대비 실측치
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">종합 환산점수:</span>
            <span
              className={`ml-1.5 text-base font-bold font-mono ${
                overallScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {overallScore.toFixed(1)}점
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isPassed ? '규격 충족 (PASS)' : '규격 미달 (FAIL)'}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 9 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RadarDataPoint;
                  const isItemPass = data.measured >= data.benchmark;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                      <p className="font-bold text-white mb-1">{data.subject}</p>
                      <div className="space-y-0.5">
                        <p className="text-blue-300 flex justify-between gap-4">
                          <span>실측 점수:</span>
                          <span className="font-mono font-bold">
                            {data.measured} {data.unit}
                          </span>
                        </p>
                        <p className="text-amber-400 flex justify-between gap-4">
                          <span>최소 적합선:</span>
                          <span className="font-mono">{data.benchmark} {data.unit}</span>
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            isItemPass ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isItemPass ? '✓ 규격 합격' : '✕ 기준치 미달'}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="경찰규격 기준선 (80점)"
              dataKey="benchmark"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.15}
              strokeDasharray="4 4"
            />
            <Radar
              name="실측 점수 (Measured)"
              dataKey="measured"
              stroke={isPassed ? '#3b82f6' : '#ef4444'}
              fill={isPassed ? '#3b82f6' : '#ef4444'}
              fillOpacity={0.4}
            />
            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini metric badges */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-slate-800/80">
        {chartData.map((item) => (
          <div
            key={item.subject}
            className={`p-2 rounded-lg text-center border ${
              item.measured >= item.benchmark
                ? 'bg-slate-800/50 border-slate-700/60'
                : 'bg-rose-950/30 border-rose-800/50'
            }`}
          >
            <div className="text-[10px] text-slate-400 truncate">{item.subject}</div>
            <div
              className={`text-sm font-bold font-mono mt-0.5 ${
                item.measured >= item.benchmark ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {item.measured}
              <span className="text-[10px] font-normal text-slate-500 ml-0.5">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
