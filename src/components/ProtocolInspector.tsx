import React, { useState } from 'react';
import {
  Binary,
  Layers,
  ArrowRightLeft,
  FileCode2,
  Server,
  Radio,
  Clock,
  Check,
  Copy,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PROTOCOL_OPCODES, POLICE_AGENCIES, VIOLATION_CODES } from '../data/standardData';
import { OpcodeItem } from '../types/standard';

export const ProtocolInspector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | '정보수집' | '원격제어' | '차적조회'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpcode, setSelectedOpcode] = useState<OpcodeItem>(PROTOCOL_OPCODES[0]);

  // File Name Generator inputs
  const [agencyCode, setAgencyCode] = useState('11'); // 서울
  const [localNumber, setLocalNumber] = useState('F0001');
  const [laneCode, setLaneCode] = useState('01'); // 1차로
  const [violationCode, setViolationCode] = useState('01'); // 속도위반
  const [imageType, setImageType] = useState<'J' | 'M'>('J'); // JPG
  const [photoType, setPhotoType] = useState<'C' | 'L' | 'T' | 'H'>('C'); // 차량 이미지
  const [sequence, setSequence] = useState('XX'); // XX or 00~07
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);

  // File Name Parser input
  const [inputToParse, setInputToParse] = useState('11_F0001_20261023120000000_01_01.DAT');

  // Filter opcodes
  const filteredOpcodes = PROTOCOL_OPCODES.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.port.toString().includes(searchTerm);
    return matchCat && matchSearch;
  });

  // Current timestamp for filename (17 digits: YYYYMMDDHH24MISSFF3)
  const currentTimestamp = '20261023120000000';

  // Generated 36-char DAT filename
  const generatedDatName = `${agencyCode}_${localNumber.padStart(5, '0')}_${currentTimestamp}_${laneCode}_${violationCode}.DAT`;
  // Generated 40-char Image filename
  const generatedImageName = `${agencyCode}_${localNumber.padStart(5, '0')}_${currentTimestamp}_${laneCode}_${imageType}_${photoType}_${sequence}.${imageType === 'J' ? 'JPG' : 'MP4'}`;

  // Parse input filename
  const parseResult = React.useMemo(() => {
    const clean = inputToParse.trim();
    if (clean.length === 36 && clean.endsWith('.DAT')) {
      const parts = clean.slice(0, -4).split('_');
      if (parts.length === 5) {
        const agency = POLICE_AGENCIES.find((a) => a.code === parts[0]);
        const viol = VIOLATION_CODES.find((v) => v.code === parts[4]);
        return {
          valid: true,
          type: '위반정보 데이터 파일 (.DAT, 36자리)',
          agency: agency ? `${agency.name} (${parts[0]})` : `알 수 없는 청코드 (${parts[0]})`,
          deviceId: parts[1],
          time: parts[2],
          lane: parts[3] === '00' ? '보도' : parts[3].startsWith('F') ? `후면 ${parts[3]}차로` : `전면 ${parts[3]}차로`,
          violation: viol ? `${viol.name} (${parts[4]})` : `알 수 없는 코드 (${parts[4]})`,
        };
      }
    } else if (clean.length === 40 && (clean.endsWith('.JPG') || clean.endsWith('.MP4'))) {
      const ext = clean.slice(-3);
      const parts = clean.slice(0, -4).split('_');
      if (parts.length === 7) {
        const agency = POLICE_AGENCIES.find((a) => a.code === parts[0]);
        const photoTypeNames: Record<string, string> = {
          C: 'C (차량 전체 이미지)',
          L: 'L (번호판 확대 이미지)',
          T: 'T (교차로 트래킹 분할영상)',
          H: 'H (이륜차 안전모 확대 이미지)',
        };
        return {
          valid: true,
          type: `위반 영상 이미지/동영상 파일 (.${ext}, 40자리)`,
          agency: agency ? `${agency.name} (${parts[0]})` : `알 수 없는 청코드 (${parts[0]})`,
          deviceId: parts[1],
          time: parts[2],
          lane: parts[3] === '00' ? '보도' : parts[3].startsWith('F') ? `후면 ${parts[3]}차로` : `전면 ${parts[3]}차로`,
          imageType: parts[4] === 'J' ? 'JPG 스틸컷' : 'MP4 동영상',
          photoType: photoTypeNames[parts[5]] || `기타 (${parts[5]})`,
          sequence: parts[6],
        };
      }
    }
    return {
      valid: false,
      error: '규격서의 36자리 DAT 파일명 또는 40자리 이미지 파일명 형식과 일치하지 않습니다.',
    };
  }, [inputToParse]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFilename(key);
    setTimeout(() => setCopiedFilename(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <span>제Ⅲ장 무인교통단속장비 센터 기능 및 규격</span>
          <span>·</span>
          <span>4. 지역제어장치 간 통신규약</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          TCP/IP 통신규약 & 패킷 프로토콜 인스펙터
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          22바이트 패킷 헤더 구조, OPCODE(0x10~0x49) 명세, 36/40자리 파일명 생성기 및 패킷 전송 Flow 정책
        </p>
      </div>

      {/* Frame Structure Visualizer (<표 30>) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Binary className="w-4 h-4 text-blue-600" />
              표준 패킷 프레임 구조 (총 24바이트 기본 오버헤드, Big-Endian)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SCODE(2B) + SND(1B) + RCV(1B) + OPCODE(2B) + LOCAL NUMBER(5B) + SEQ NO(2B) + LENGTH(4B) + DATA(N) + TAIL(2B)
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-semibold">
            CharacterEncoding: EUC-KR
          </span>
        </div>

        {/* Visual Byte Layout Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <span className="text-[10px] text-blue-600 font-mono block">2 BYTES</span>
            <span className="text-xs font-bold text-blue-900 block mt-1">SCODE</span>
            <span className="text-[11px] font-mono text-blue-700 block mt-0.5">0x98 0x98</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-mono block">1 BYTE</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">SND ID</span>
            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">0x00 / 0x01</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-mono block">1 BYTE</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">RCV ID</span>
            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">0x00 / 0x01</span>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <span className="text-[10px] text-indigo-600 font-mono block">2 BYTES</span>
            <span className="text-xs font-bold text-indigo-900 block mt-1">OPCODE</span>
            <span className="text-[11px] font-mono text-indigo-700 block mt-0.5">Func + Proc</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-mono block">5 CHAR</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">LOCAL NO</span>
            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">"F0001" 등</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-mono block">2 WORD</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">SEQ NO</span>
            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">0 ~ 65535</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-mono block">4 UINT</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">LENGTH</span>
            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">Data부 크기</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <span className="text-[10px] text-amber-600 font-mono block">2 BYTES</span>
            <span className="text-xs font-bold text-amber-900 block mt-1">TAIL (End)</span>
            <span className="text-[11px] font-mono text-amber-700 block mt-0.5">0x89 0x89</span>
          </div>
        </div>

        {/* Big-Endian note & MT19937 jitter rule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-700 block">바이트 순서 (Byte Order)</span>
            <p className="text-slate-500 mt-0.5">BIG ENDIAN 규약 준수 (상위 바이트가 메모리 낮은 주소에 먼저 위치)</p>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">통신 실패 및 지터 (Jitter)</span>
            <p className="text-slate-500 mt-0.5">MT19937 난수 발생을 통해 60초~1,800초 범위 내 무작위 분산 재접속</p>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">시각 불일치 NACK (0x24)</span>
            <p className="text-slate-500 mt-0.5">센터와 시각 오차 5초 초과 시 0x24 반환 및 세션 종료 ➔ 내부 NTP 동기화</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: OPCODE Explorer & File Name Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: OPCODE Directory Browser (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                OPCODE 및 전용 통신포트 탐색기 (표 29, 표 33)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                포트 8701~8708 (정보수집), 8801~8804 (원격제어), 55000/55010 (차적조회/정기검사)
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
              {(['all', '정보수집', '원격제어', '차적조회'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
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

          {/* Search Opcode */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="OPCODE 검색 (예: 0x10, 0x21, 0x34, 8707, 꼬리물기, 리셋...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Opcodes List */}
          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
            {filteredOpcodes.map((item) => {
              const isSelected = selectedOpcode.code === item.code;
              return (
                <div
                  key={item.code}
                  onClick={() => setSelectedOpcode(item)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        TCP {item.port}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.direction}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Opcode Detail Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">
                선택 항목: {selectedOpcode.name} ({selectedOpcode.code})
              </span>
              <span className="text-slate-500 font-mono">
                클라이언트: {selectedOpcode.client} ➔ 서버: {selectedOpcode.server}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mt-1">{selectedOpcode.description}</p>
          </div>
        </div>

        {/* Right: 36-char / 40-char File Name Builder & Parser (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Name Generator */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              표준 파일명 생성기 (36자리 DAT / 40자리 이미지)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  1. 관할 시·도경찰청 고유번호 (2자리)
                </label>
                <select
                  value={agencyCode}
                  onChange={(e) => setAgencyCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                >
                  {POLICE_AGENCIES.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} : {a.name} ({a.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    2. 지역제어기 번호 (5자리)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={localNumber}
                    onChange={(e) => setLocalNumber(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    3. 위반 차로번호 (2자리)
                  </label>
                  <select
                    value={laneCode}
                    onChange={(e) => setLaneCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  >
                    <option value="00">00 : 보도 (인도)</option>
                    <option value="01">01 : 1차로 (전면)</option>
                    <option value="02">02 : 2차로 (전면)</option>
                    <option value="03">03 : 3차로 (전면)</option>
                    <option value="F1">F1 : 1차로 (후면단속)</option>
                    <option value="F2">F2 : 2차로 (후면단속)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  4. 위반종류 코드 (2자리)
                </label>
                <select
                  value={violationCode}
                  onChange={(e) => setViolationCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                >
                  {VIOLATION_CODES.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.code} : {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Output 36-char DAT */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  생성된 위반 데이터 파일명 (총 36자리 .DAT)
                </span>
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 text-blue-300 font-mono rounded-lg text-xs">
                  <span className="truncate">{generatedDatName}</span>
                  <button
                    onClick={() => copyToClipboard(generatedDatName, 'dat')}
                    className="p-1 hover:text-white transition-colors shrink-0"
                    title="복사"
                  >
                    {copiedFilename === 'dat' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Output 40-char Image */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  생성된 위반 이미지 파일명 (총 40자리 .JPG)
                </span>
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 text-emerald-300 font-mono rounded-lg text-xs">
                  <span className="truncate">{generatedImageName}</span>
                  <button
                    onClick={() => copyToClipboard(generatedImageName, 'img')}
                    className="p-1 hover:text-white transition-colors shrink-0"
                    title="복사"
                  >
                    {copiedFilename === 'img' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Name Parser */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
              파일명 유효성 검사 및 필드 분석기
            </h3>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={inputToParse}
                onChange={(e) => setInputToParse(e.target.value)}
                placeholder="검사할 파일명을 입력하세요"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white"
              />

              {parseResult.valid ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>정상 규격 파일명: {parseResult.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200 text-slate-700">
                    <div>
                      <span className="text-slate-400 block">경찰청:</span>
                      <span className="font-semibold">{parseResult.agency}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">제어기번호:</span>
                      <span className="font-semibold font-mono">{parseResult.deviceId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">차로:</span>
                      <span className="font-semibold">{parseResult.lane}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">항목:</span>
                      <span className="font-semibold">{parseResult.violation || parseResult.photoType}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">규격 불일치</span>
                    <p className="text-[11px] mt-0.5">{parseResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
