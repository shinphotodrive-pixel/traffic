import React, { useState } from 'react';
import {
  Camera,
  Car,
  Plane,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  Eye,
  Sliders,
  Battery,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ENFORCEMENT_FUNCTIONS } from '../data/standardData';

export const EquipmentMatrix: React.FC<{ onSelectFunction?: (id: string) => void }> = ({ onSelectFunction }) => {
  const [selectedEquip, setSelectedEquip] = useState<'fixed' | 'mobile' | 'vehicle' | 'drone'>('fixed');
  const [filterFunction, setFilterFunction] = useState<string>('all');

  const equipSpecs = {
    fixed: {
      name: '고정식 무인교통단속장비',
      subName: '도로변 지주 고정 설치형 (매설식 및 비매설식)',
      speedRange: '0 ~ 250 km/h (전 속도영역 단속)',
      lanes: '매설식 3개 차로 / 비매설식 2개 차로 이상 (팬틸트 차로변경 지원)',
      camera: '고속 촬영 카메라 (최대 250km/h 지원), 광학 줌/포커스, TTA 보안인증 필수',
      lighting: '적외선 파장 700nm 이상 (방사강도 변화율 10% 이내, 1,000만회 내구 보장)',
      storage: '단속자료 2개월 이상 보관용량 확보, 센터 전송 후 즉시 삭제, 점검기록 영구 보존',
      power: 'AC 220V 전원공급장치 (자연통풍 방열, 안정된 DC 공급)',
      sync: '내부 NTP(Network Time Protocol) 서버와 직접 동기화 (TEMS 통신서버 경유 금지)',
      housing: '스테인리스 2중 방열 구조, 방수형, 전후 잠금장치, 내부 온도센서 및 도어감지센서',
      special: '교통신호등/제어기 고장 시 신호위반 단속은 자동 정지하고 속도위반 단속만 수행',
    },
    mobile: {
      name: '이동식 무인교통단속장비',
      subName: '이동식 삼각대 또는 단속카메라 부스 이동 운영형',
      speedRange: '5 ~ 250 km/h (주·야간 동일 검지)',
      lanes: '단속차로 선택적 변경 및 다차로 동시 단속 가능',
      camera: '전면 촬영 원칙 (필요 시 후면 촬영 가능), 주야간 촬영거리 검지거리와 동일',
      lighting: '적외선 파장 700nm 이상 조명 (일체형 또는 탈부착형 일체형, 1,000만회 보장)',
      storage: '단속자료 4,000장 이상 보존용량, JPEG(PCX, BMP 지원)',
      power: '교류 주전원 + 충전식 배터리 보조전원(최소 4시간 이상, 15kg 이하, 잔량 자동체크), 차량 12VDC',
      sync: 'GPS 수신기를 통해 실시간 표준시간과 동기화',
      housing: '전천후 특수 방수 기능, 이동 및 휴대가 용이한 하드케이스 제공',
      special: '시·도경찰청 및 경찰서 차적조회 라인 연동, 위반사실통지서 및 해상일지 현장 출력',
    },
    vehicle: {
      name: '차량탑재형 무인교통단속장비',
      subName: '고속도로 순찰차 및 암행순찰차 탑재 주행/정차 단속형',
      speedRange: '0 ~ 300 km/h (주행 및 주·정차 중 자동 단속)',
      lanes: '최소 2개 이상의 차로 연속 검지 (전방/좌측/우측 3개 차로 확장 가능)',
      camera: '500만 화소(5MP) 이상, 프리셋 및 100m 이상 전동줌 기능 탑재, 차량 후면 촬영 원칙',
      lighting: '적외선 파장 700nm 이상 조명 (방사강도 변화율 10% 이내)',
      storage: '단속영상 4,000장 이상 보존용량, 단속 전·후 10초 자동녹화 (MP4 지원)',
      power: '차량용 12VDC (또는 변환된 교류 지원)',
      sync: 'GPS 수신기를 통한 실시간 표준시간 동기화 (차량 위치 자동 연계)',
      housing: '차량 외부에 설치되는 장치는 전천후 특수 방수 기능 필수',
      special: '별도 조작 없이 전자동 주행 중 속도측정·번호판인식, 무선 리모콘/키보드 제어',
    },
    drone: {
      name: '드론탑재형 무인교통단속장비',
      subName: '고속도로 상공 비행 영상 수집 및 지상 제어 노트북 연동형',
      speedRange: '영상 궤적 기반 차량 거동 분석 (지정차로, 갓길, 버스전용, 진로변경)',
      lanes: '고속도로 편도 2차로 ~ 4차로 상공 전체 조망',
      camera: '고해상도 영상 수집 카메라, 차량 차로·번호판·궤적 자동 수집 및 번호인식',
      lighting: '주간 단속 원칙 (고속도로 휴게소 또는 졸음쉼터 등 정해진 지점 상공 비행)',
      storage: '임무수행 노트북에 자체 DB 구조 탑재, 단속자료 자동/수동 센터 전송',
      power: '드론 배터리 및 지상제어장치 전원 체계',
      sync: '지상제어 노트북 단속프로그램 표준시간 동기화',
      housing: '경찰청 공식 운영·관리 드론으로 한정, 도로 외 상공만 비행하여 추락사고 방지',
      special: '보조영상 8컷 균등 확보 필수, 번호인식영상과 보조영상의 영상일치도 100% 필수',
    },
  };

  const filteredFunctions = ENFORCEMENT_FUNCTIONS.filter((fn) => {
    if (filterFunction === 'all') return true;
    if (filterFunction === 'fixed') return fn.fixed;
    if (filterFunction === 'mobile') return fn.mobile;
    if (filterFunction === 'vehicle') return fn.vehicle;
    if (filterFunction === 'drone') return fn.drone;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <span>제Ⅱ장 무인교통단속장비 규격</span>
          <span>·</span>
          <span>표 2 설치 및 운영형태별 단속기능</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          장비 유형별 단속기능 및 하드웨어 사양 매트릭스
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          고정식, 이동식, 차량탑재형, 드론탑재형 4대 단속장비의 기능별 성능기준과 필수 하드웨어 스펙 비교
        </p>
      </div>

      {/* Equipment Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { id: 'fixed', label: '고정식 장비', desc: '지주 고정 / 매설·비매설', icon: Camera },
          { id: 'mobile', label: '이동식 장비', desc: '삼각대·부스 이동식', icon: Radio },
          { id: 'vehicle', label: '차량탑재형 장비', desc: '순찰차·암행차 주행단속', icon: Car },
          { id: 'drone', label: '드론탑재형 장비', desc: '고속도로 상공 단속', icon: Plane },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedEquip === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedEquip(item.id as any)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  SPEC
                </span>
              </div>
              <h3 className="text-sm font-bold truncate">{item.label}</h3>
              <p
                className={`text-xs mt-0.5 truncate ${
                  isSelected ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Equipment Hardware Specification Detail Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono text-blue-600 font-semibold block">
              EQUIPMENT SPECIFICATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {equipSpecs[selectedEquip].name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {equipSpecs[selectedEquip].subName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-slate-700">경찰청 KPS 표준 인증 대상</span>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              측정 및 검지 속도 범위
            </span>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {equipSpecs[selectedEquip].speedRange}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              단속 차로 수 및 범위
            </span>
            <p className="text-sm font-medium text-slate-800">
              {equipSpecs[selectedEquip].lanes}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              카메라 및 광학 센서
            </span>
            <p className="text-sm font-medium text-slate-800">
              {equipSpecs[selectedEquip].camera}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              야간 조명 장치 (IR LED)
            </span>
            <p className="text-sm font-medium text-slate-800">
              {equipSpecs[selectedEquip].lighting}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              단속 데이터 저장 및 보존
            </span>
            <p className="text-sm font-medium text-slate-800">
              {equipSpecs[selectedEquip].storage}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-blue-600" />
              전원 공급 및 배터리 사양
            </span>
            <p className="text-sm font-medium text-slate-800">
              {equipSpecs[selectedEquip].power}
            </p>
          </div>
        </div>

        {/* Special Operational Criteria Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/70 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block mb-0.5">운영 및 안전 특수 규정</span>
            <p className="text-slate-600 leading-relaxed">
              {equipSpecs[selectedEquip].special} (함체: {equipSpecs[selectedEquip].housing} / 시각동기화: {equipSpecs[selectedEquip].sync})
            </p>
          </div>
        </div>
      </div>

      {/* Enforcement Function Support Matrix Table (<표 2>) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              11대 단속기능 지원 여부 및 정밀 성능기준 요약 (표 2)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              설치 형태별 단속 가능 여부 및 한국도로교통공단 성능검사 판정 기준
            </p>
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'all', label: '전체 기능 (11종)' },
              { id: 'fixed', label: '고정식 지원' },
              { id: 'mobile', label: '이동식 지원' },
              { id: 'vehicle', label: '차량탑재 지원' },
              { id: 'drone', label: '드론탑재 지원' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterFunction(f.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filterFunction === f.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-5 py-3 text-left">단속기능 명칭</th>
                <th className="px-4 py-3 text-left">법적 근거</th>
                <th className="px-3 py-3 text-center">고정식</th>
                <th className="px-3 py-3 text-center">이동식</th>
                <th className="px-3 py-3 text-center">차량탑재</th>
                <th className="px-3 py-3 text-center">드론탑재</th>
                <th className="px-5 py-3 text-left">성능 검사 기준 요약</th>
                <th className="px-4 py-3 text-left">허용 오차 한계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredFunctions.map((fn) => (
                <tr key={fn.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {fn.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono">
                    {fn.legalBasis}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {fn.fixed ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold font-mono">○</span>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {fn.mobile ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold font-mono">○</span>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {fn.vehicle ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold font-mono">○</span>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {fn.drone ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold font-mono">
                        {fn.droneNote ? '△' : '○'}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 min-w-[280px]">
                    {fn.criteriaSummary}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-blue-700 font-semibold whitespace-nowrap">
                    {fn.targetTolerance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>○: 지원 (운영) · -: 미지원 · △: 가변등 신호위반 등 조건부 적용</span>
          <span className="font-mono text-slate-400">경찰청 규격서 제Ⅱ장 표 2 기준</span>
        </div>
      </div>
    </div>
  );
};
