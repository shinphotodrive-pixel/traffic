import React, { useState } from 'react';
import { PROTOCOL_OPCODES, VIOLATION_CODES, POLICE_AGENCIES } from '../data/standardData';
import { HeaderValidationResult } from '../types/standard';
import { downloadJson, exportElementToPdf } from '../utils/exportUtils';
import {
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  Printer,
  ShieldCheck,
  Search,
  FileCode,
  Tag,
  ArrowRight,
  Server,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

export const ProtocolInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'validator' | 'frame' | 'opcodes' | 'filename'>('validator');

  // Validator state
  // Default sample: 2026 Standard Enforcement Data (0x10)
  // STX(98 98), DIR(53 4E 44 = SND), ID(30 30 31 30 31 = '00101'), OPCODE(30 30 31 30 = '0010'), SEQ(00 01), LEN(00 00 00 08), DATA(41 42 43 44 45 46 47 48), ETX(89 89)
  const defaultPacket =
    '98 98 53 4E 44 30 30 31 30 31 30 30 31 30 00 01 00 00 00 08 41 42 43 44 45 46 47 48 89 89';
  const [hexInput, setHexInput] = useState(defaultPacket);
  const [validationResult, setValidationResult] = useState<HeaderValidationResult | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Opcode search
  const [opcodeSearch, setOpcodeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filename generator state
  const [fileAgency, setFileAgency] = useState('02'); // 서울
  const [fileEquipNum, setFileEquipNum] = useState('10250');
  const [fileDate, setFileDate] = useState('20260315');
  const [fileTime, setFileTime] = useState('143025');
  const [fileLane, setFileLane] = useState('02');
  const [fileViolation, setFileViolation] = useState('01'); // 속도위반
  const [fileSeq, setFileSeq] = useState('001');

  // Reverse Parser state
  const [inputFilename, setInputFilename] = useState('0210250_20260315_143025_02_01_001.jpg');

  // Validate 2026 Header function
  const runValidation = (rawHex: string) => {
    const cleaned = rawHex.replace(/[\s\r\n]/g, '').toUpperCase();
    const bytes: number[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.substr(i, 2), 16));
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const fields: HeaderValidationResult['fields'] = [];
    let passedChecks = 0;
    const totalChecks = 7;

    // 1. Minimum Length Check
    if (bytes.length < 22) {
      errors.push(`패킷 바이트 수 부족: 최소 헤더 22바이트 이상이어야 함 (현재 ${bytes.length} Bytes)`);
    }

    // 2. Start STX Check (0x98 0x98)
    const stx1 = bytes[0];
    const stx2 = bytes[1];
    const actualStx =
      stx1 !== undefined && stx2 !== undefined
        ? `0x${stx1.toString(16).padStart(2, '0').toUpperCase()} 0x${stx2.toString(16).padStart(2, '0').toUpperCase()}`
        : '없음';
    if (stx1 === 0x98 && stx2 === 0x98) {
      passedChecks++;
      fields.push({
        name: 'STX (시작 바이트)',
        expected: '0x98 0x98 (2026 표준 고정)',
        actual: actualStx,
        status: 'pass',
        description: '2026 경찰규격 패킷 시작 식별자 정상 일치',
      });
    } else {
      errors.push(`STX 불일치: 2026 규격은 0x98 0x98 필수 (현재: ${actualStx})`);
      fields.push({
        name: 'STX (시작 바이트)',
        expected: '0x98 0x98',
        actual: actualStx,
        status: 'fail',
        description: '패킷 시작 바이트 오류 (비인가 패킷 또는 프레임 손상)',
      });
    }

    // 3. Direction (Bytes 2..4: 'SND' or 'RCV')
    const dirBytes = bytes.slice(2, 5);
    const dirStr = String.fromCharCode(...dirBytes);
    if (dirStr === 'SND' || dirStr === 'RCV') {
      passedChecks++;
      fields.push({
        name: 'Direction (송수신 방향)',
        expected: 'SND (송신) 또는 RCV (수신)',
        actual: `${dirStr} (3 Bytes ASCII)`,
        status: 'pass',
        description: dirStr === 'SND' ? '단속장비 → 센터 전송' : '센터 → 단속장비 응답',
      });
    } else {
      errors.push(`방향 식별자 오류: SND 또는 RCV이어야 함 (현재: '${dirStr}')`);
      fields.push({
        name: 'Direction (송수신 방향)',
        expected: 'SND / RCV',
        actual: `'${dirStr}'`,
        status: 'fail',
        description: '유효하지 않은 송수신 방향 코드',
      });
    }

    // 4. Local ID (Bytes 5..9: 5 Bytes ASCII)
    const idBytes = bytes.slice(5, 10);
    const idStr = String.fromCharCode(...idBytes);
    const isIdPrintable = idBytes.length === 5 && idBytes.every((b) => b >= 32 && b <= 126);
    if (isIdPrintable) {
      passedChecks++;
      fields.push({
        name: 'Local Device ID (지역장비번호)',
        expected: '5 Bytes ASCII (영숫자)',
        actual: `'${idStr}'`,
        status: 'pass',
        description: '5자리 지역제어기 고유 번호 형식 충족',
      });
    } else {
      errors.push('장비번호 오류: 5자리 영숫자 ASCII 코드여야 함');
      fields.push({
        name: 'Local Device ID',
        expected: '5 Bytes ASCII',
        actual: idBytes.length < 5 ? `길이 부족 (${idBytes.length}B)` : '비출력 문자 포함',
        status: 'fail',
        description: '장비 식별 번호 길이 또는 인코딩 결함',
      });
    }

    // 5. Opcode (Bytes 10..13: 4 Bytes ASCII or hex)
    const opBytes = bytes.slice(10, 14);
    const opStr = String.fromCharCode(...opBytes);
    // Common opcodes in 2026 specs: '0010', '0021', '0031', '0034', '0095', '0098' or hex 0x10, etc.
    const knownOpcodes = ['0010', '0021', '0031', '0034', '0095', '0098', '0011', '0012', '0015', '0022'];
    const isOpMatch = knownOpcodes.includes(opStr) || opBytes[3] === 0x10 || opBytes[3] === 0x34 || opBytes[3] === 0x21;

    if (isOpMatch) {
      passedChecks++;
      fields.push({
        name: 'OPCODE (명령어 코드)',
        expected: '2026 표준 등록 OPCODE (4 Bytes)',
        actual: `'${opStr}' (0x${opBytes.map((b) => b.toString(16).padStart(2, '0')).join('')})`,
        status: 'pass',
        description: '2026 무인단속시스템 공인 동작 명령 코드 일치',
      });
    } else {
      warnings.push(`미등록 또는 비표준 OPCODE 감지: '${opStr}'`);
      fields.push({
        name: 'OPCODE (명령어 코드)',
        expected: '2026 등록 OPCODE (0010, 0021, 0034 등)',
        actual: `'${opStr}'`,
        status: 'warn',
        description: '표준 정의 목록 외 사용자 정의 확장 코드이거나 비인가 명령',
      });
    }

    // 6. Sequence Number (Bytes 14..15: 2 Bytes Big-Endian)
    const seq = bytes.length >= 16 ? (bytes[14] << 8) | bytes[15] : null;
    if (seq !== null) {
      passedChecks++;
      fields.push({
        name: 'SEQ (시퀀스 일련번호)',
        expected: '2 Bytes Big-Endian (0 ~ 65535)',
        actual: `${seq} (0x${bytes[14].toString(16).padStart(2, '0')}${bytes[15].toString(16).padStart(2, '0')})`,
        status: 'pass',
        description: '패킷 중복 및 누락 방지 시퀀스 넘버 정상 파싱',
      });
    } else {
      errors.push('SEQ 파싱 실패');
      fields.push({
        name: 'SEQ',
        expected: '2 Bytes Big-Endian',
        actual: '누락',
        status: 'fail',
        description: '시퀀스 바이트 누락',
      });
    }

    // 7. Data Length (Bytes 16..19: 4 Bytes Big-Endian)
    const dataLen =
      bytes.length >= 20
        ? (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]
        : null;
    if (dataLen !== null && dataLen >= 0) {
      passedChecks++;
      const payloadBytesCount = bytes.length - 22; // without 20B header & 2B trailer if present
      const lenMatch = payloadBytesCount >= dataLen;
      fields.push({
        name: 'Data Length (페이로드 길이)',
        expected: '4 Bytes Big-Endian',
        actual: `${dataLen} Bytes (수신 데이터: ${Math.max(0, payloadBytesCount)} Bytes)`,
        status: lenMatch ? 'pass' : 'warn',
        description: lenMatch
          ? '헤더 명시 데이터 길이와 수신 페이로드 길이 일치'
          : '명시된 길이와 실제 페이로드 바이트 수 불일치 주의',
      });
      if (!lenMatch) {
        warnings.push(`페이로드 길이 불일치: 헤더(${dataLen}B) != 수신(${payloadBytesCount}B)`);
      }
    } else {
      errors.push('Data Length 필드 파싱 실패');
      fields.push({
        name: 'Data Length',
        expected: '4 Bytes Big-Endian',
        actual: '누락',
        status: 'fail',
        description: '길이 필드 누락',
      });
    }

    // 8. Trailer ETX Check (Last 2 Bytes: 0x89 0x89)
    const last1 = bytes[bytes.length - 2];
    const last2 = bytes[bytes.length - 1];
    const actualEtx =
      last1 !== undefined && last2 !== undefined
        ? `0x${last1.toString(16).padStart(2, '0').toUpperCase()} 0x${last2.toString(16).padStart(2, '0').toUpperCase()}`
        : '없음';
    if (last1 === 0x89 && last2 === 0x89) {
      passedChecks++;
      fields.push({
        name: 'ETX (종료 바이트)',
        expected: '0x89 0x89 (2026 표준 트레일러)',
        actual: actualEtx,
        status: 'pass',
        description: '프레임 종료 바이트 정확 일치',
      });
    } else {
      warnings.push(`ETX 불일치: 2026 규격 종료바이트 0x89 0x89 권장 (현재: ${actualEtx})`);
      fields.push({
        name: 'ETX (종료 바이트)',
        expected: '0x89 0x89',
        actual: actualEtx,
        status: 'warn',
        description: '종료 식별자 불일치 (스트림 분할 패킷일 수 있음)',
      });
    }

    const score = Math.round((passedChecks / (totalChecks + 1)) * 100);
    const isValid = errors.length === 0 && score >= 80;

    const result: HeaderValidationResult = {
      isValid,
      score,
      totalChecks: totalChecks + 1,
      passedChecks,
      errors,
      warnings,
      fields,
    };

    setValidationResult(result);
  };

  // Presets
  const presets = [
    {
      name: '[정상] 2026 단속자료 전송 (0x10)',
      hex: '98 98 53 4E 44 30 30 31 30 31 30 30 31 30 00 01 00 00 00 08 41 42 43 44 45 46 47 48 89 89',
    },
    {
      name: '[정상] 2026 하트비트 상태보고 (0x34)',
      hex: '98 98 53 4E 44 30 30 31 30 31 30 30 33 34 00 05 00 00 00 04 4F 4B 30 31 89 89',
    },
    {
      name: '[정상] 2026 센터 시간동기화 요청 (0x21)',
      hex: '98 98 52 43 56 30 30 31 30 31 30 30 32 31 00 02 00 00 00 06 53 59 4E 43 30 31 89 89',
    },
    {
      name: '[오류] 시작 바이트(STX) 손상',
      hex: '02 02 53 4E 44 30 30 31 30 31 30 30 31 30 00 01 00 00 00 08 41 42 43 44 45 46 47 48 89 89',
    },
    {
      name: '[오류] 미등록 불법 OPCODE (0xFF)',
      hex: '98 98 53 4E 44 30 30 31 30 31 46 46 46 46 00 01 00 00 00 04 01 02 03 04 89 89',
    },
    {
      name: '[오류] 송수신 식별자 손상 (DIR 오류)',
      hex: '98 98 58 59 5A 30 30 31 30 31 30 30 31 30 00 01 00 00 00 04 00 00 00 00 89 89',
    },
  ];

  // Opcode filtering
  const filteredOpcodes = PROTOCOL_OPCODES.filter((op) => {
    const matchesSearch =
      op.code.toLowerCase().includes(opcodeSearch.toLowerCase()) ||
      op.name.toLowerCase().includes(opcodeSearch.toLowerCase()) ||
      op.description.toLowerCase().includes(opcodeSearch.toLowerCase());
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && op.category === selectedCategory;
  });

  // Generated Filename
  const generatedFilename = `${fileAgency}${fileEquipNum}_${fileDate}_${fileTime}_${fileLane}_${fileViolation}_${fileSeq}.jpg`;

  // Parse filename
  const parseFilename = (fn: string) => {
    const clean = fn.replace('.jpg', '').replace('.JPG', '');
    const parts = clean.split('_');
    if (parts.length >= 6) {
      const agencyCode = parts[0].slice(0, 2);
      const agencyObj = POLICE_AGENCIES.find((a) => a.code === agencyCode);
      const violCode = parts[4];
      const violObj = VIOLATION_CODES.find((v) => v.code === violCode);

      return {
        isValid: true,
        agencyCode,
        agencyName: agencyObj ? `${agencyObj.region} (${agencyObj.name})` : '미등록 지방청',
        equipNo: parts[0].slice(2),
        date: `${parts[1].slice(0, 4)}-${parts[1].slice(4, 6)}-${parts[1].slice(6, 8)}`,
        time: `${parts[2].slice(0, 2)}:${parts[2].slice(2, 4)}:${parts[2].slice(4, 6)}`,
        lane: `${Number(parts[3])} 차로`,
        violation: violObj ? `${violObj.name} (${violObj.category})` : `위반코드 ${violCode}`,
        seq: parts[5],
      };
    }
    return { isValid: false };
  };

  const parsedResult = parseFilename(inputFilename);

  // Local Export Functions
  const handleExportJson = () => {
    downloadJson(
      {
        exportedAt: new Date().toISOString(),
        standard: 'KPS-08-0004-02:2026',
        inputHex: hexInput,
        validationResult: validationResult || '검증 미수행',
      },
      `2026_통신프로토콜_검증결과_${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(
        'protocol-validator-card',
        `2026_경찰규격_프로토콜_검증성적서.pdf`,
        '경찰청 통신 프로토콜 헤더 규격 검증 보고서'
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              무인교통단속장비 통신 프로토콜 인스펙터
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                2026 헤더 규격 검증기
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              KPS-08-0004-02 표준 22-Byte 헤더 자동 검증, 28종 OPCODE 카탈로그 및 위반 영상 파일명 생성·해석
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            JSON 저장
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-900/30 transition disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            {isExportingPdf ? 'PDF 출력중...' : 'PDF 내보내기'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('validator')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'validator'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          2026 헤더 규격 검증기 (규격 검증 로직)
        </button>
        <button
          onClick={() => setActiveTab('frame')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'frame'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileCode className="w-4 h-4" />
          22-Byte 헤더 구조도
        </button>
        <button
          onClick={() => setActiveTab('opcodes')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'opcodes'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Tag className="w-4 h-4" />
          28종 OPCODE 카탈로그
        </button>
        <button
          onClick={() => setActiveTab('filename')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'filename'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          파일명 규격 생성기 / 역해석
        </button>
      </div>

      {/* Tab 1: 2026 Header Specification Validator (Requirement 10) */}
      {activeTab === 'validator' && (
        <div id="protocol-validator-card" className="space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  2026 경찰규격 헤더 자동 검증 로직 (Header Specification Validator)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  수신된 HEX 바이트 스트림의 STX(0x9898), SND/RCV, 5B 장비ID, OPCODE, Big-Endian SEQ/LEN, ETX(0x8989)를 전수 검사합니다.
                </p>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setHexInput(p.hex);
                      runValidation(p.hex);
                    }}
                    className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                원시 패킷 HEX 바이트 스트림 입력 (공백 구분 16진수)
              </label>
              <textarea
                rows={3}
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="예: 98 98 53 4E 44 30 30 31 30 31 30 30 31 30 00 01 00 00 00 08 ..."
                className="w-full p-3 bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 tracking-wider"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  입력 바이트 수: {hexInput.replace(/[\s\r\n]/g, '').length / 2} Bytes
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHexInput('')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition"
                  >
                    비우기
                  </button>
                  <button
                    onClick={() => runValidation(hexInput)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-900/30 transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    규격 검증 실행
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Result Output */}
          {validationResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  validationResult.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                      validationResult.isValid
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {validationResult.isValid ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <XCircle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {validationResult.isValid
                        ? '2026 표준 헤더 규격 완전 일치 (PASS)'
                        : '2026 표준 헤더 규격 불일치 / 손상 (FAIL)'}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/80 font-mono">
                        적합도: {validationResult.score}%
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      검사항목: {validationResult.passedChecks} / {validationResult.totalChecks} 통과
                      {validationResult.errors.length > 0 && ` | 오류 ${validationResult.errors.length}건`}
                      {validationResult.warnings.length > 0 && ` | 주의 ${validationResult.warnings.length}건`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                      validationResult.isValid
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {validationResult.isValid ? '정상 프레임 수신' : '패킷 폐기/재요청'}
                  </span>
                </div>
              </div>

              {/* Errors & Warnings if any */}
              {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                <div className="space-y-2 text-xs">
                  {validationResult.errors.map((err, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                  {validationResult.warnings.map((warn, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-200 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Field by field audit table */}
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">헤더 필드명</th>
                      <th className="py-2.5 px-3">2026 규격 기준치</th>
                      <th className="py-2.5 px-3">수신된 실제 데이터</th>
                      <th className="py-2.5 px-3 text-center">검증 상태</th>
                      <th className="py-2.5 px-3">판정 사유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {validationResult.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition">
                        <td className="py-2 px-3 font-sans font-semibold text-white">
                          {f.name}
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                          {f.expected}
                        </td>
                        <td className="py-2 px-3 font-bold text-indigo-300">
                          {f.actual}
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.status === 'pass'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : f.status === 'fail'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {f.status === 'pass' ? '통과' : f.status === 'fail' ? '오류' : '주의'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">
                          {f.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 22-Byte Frame Visualizer */}
      {activeTab === 'frame' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              경찰청 무인단속시스템 2026 표준 프레임 레이아웃 (표 159)
            </h3>
            <p className="text-xs text-slate-400">
              지역제어장치(단속카메라)와 경찰청 센터통신서버 간 TCP/IP 소켓 통신 기본 22바이트 헤더 구조
            </p>
          </div>

          {/* Visual Bar of 22 Bytes */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
            <div className="col-span-2 bg-blue-900/60 border border-blue-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-blue-300 font-mono">0 ~ 1 (2B)</span>
              <strong className="text-xs text-white block">STX</strong>
              <span className="text-[10px] font-mono text-blue-200">0x98 0x98</span>
            </div>
            <div className="col-span-2 bg-purple-900/60 border border-purple-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-purple-300 font-mono">2 ~ 4 (3B)</span>
              <strong className="text-xs text-white block">DIR</strong>
              <span className="text-[10px] font-mono text-purple-200">SND / RCV</span>
            </div>
            <div className="col-span-3 bg-emerald-900/60 border border-emerald-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-emerald-300 font-mono">5 ~ 9 (5B)</span>
              <strong className="text-xs text-white block">LOCAL ID</strong>
              <span className="text-[10px] font-mono text-emerald-200">장비관리번호</span>
            </div>
            <div className="col-span-2 bg-amber-900/60 border border-amber-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-amber-300 font-mono">10 ~ 13 (4B)</span>
              <strong className="text-xs text-white block">OPCODE</strong>
              <span className="text-[10px] font-mono text-amber-200">명령어 코드</span>
            </div>
            <div className="col-span-1 bg-cyan-900/60 border border-cyan-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-cyan-300 font-mono">14~15 (2B)</span>
              <strong className="text-xs text-white block">SEQ</strong>
              <span className="text-[9px] font-mono text-cyan-200">일련번호</span>
            </div>
            <div className="col-span-2 bg-rose-900/60 border border-rose-600/60 p-2.5 rounded-lg">
              <span className="block text-[10px] text-rose-300 font-mono">16 ~ 19 (4B)</span>
              <strong className="text-xs text-white block">LENGTH</strong>
              <span className="text-[10px] font-mono text-rose-200">데이터길이(BE)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-400" />
              프레임 규격 주요 기술 지침
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed text-[11px]">
              <li>모든 정수형 필드(SEQ, LENGTH)는 빅엔디언(Big-Endian) 방식을 준수해야 합니다.</li>
              <li>데이터 페이로드(Payload) 뒤에는 반드시 종료 트레일러(ETX 0x89 0x89) 2바이트가 부가됩니다.</li>
              <li>단속자료 전송(OPCODE 0x10) 시 위반 차량 고해상도 JPG 이미지와 XML 메타데이터가 패킷화되어 순차 전송됩니다.</li>
              <li>센터는 단속데이터 수신 직후 1초(1,000ms) 이내에 수신 확인 ACK 패킷을 회신해야 합니다.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: 28 Opcode Catalog */}
      {activeTab === 'opcodes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                경찰청 2026 표준 통신 프로토콜 OPCODE 28종 카탈로그
              </h3>
              <p className="text-xs text-slate-400">
                정보수집, 원격제어, 차적조회 3대 범주의 포트 및 송수신 규격
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="코드명, 설명 검색..."
                  value={opcodeSearch}
                  onChange={(e) => setOpcodeSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="all">전체 범주 ({PROTOCOL_OPCODES.length})</option>
                <option value="정보수집">정보수집</option>
                <option value="원격제어">원격제어</option>
                <option value="차적조회">차적조회</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-[480px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">OPCODE</th>
                  <th className="py-2.5 px-3">명령어 명칭</th>
                  <th className="py-2.5 px-3">분류</th>
                  <th className="py-2.5 px-3">포트</th>
                  <th className="py-2.5 px-3">방향 (송신 → 수신)</th>
                  <th className="py-2.5 px-3">기능 설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredOpcodes.map((op, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3 font-mono font-bold text-indigo-400">
                      {op.code}
                    </td>
                    <td className="py-2 px-3 font-semibold text-white">
                      {op.name}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          op.category === '정보수집'
                            ? 'bg-blue-500/20 text-blue-300'
                            : op.category === '원격제어'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {op.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">{op.port}</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">
                      {op.client} → {op.server}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {op.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Filename Generator & Parser */}
      {activeTab === 'filename' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Generator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              위반영상 표준 파일명 생성기 (2026 규격)
            </h3>
            <p className="text-xs text-slate-400">
              규격 형식: [지방청2B + 장비5B]_[날짜8B]_[시간6B]_[차로2B]_[위반2B]_[순번3B].jpg
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">관할 지방경찰청</label>
                <select
                  value={fileAgency}
                  onChange={(e) => setFileAgency(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {POLICE_AGENCIES.map((a) => (
                    <option key={a.code} value={a.code}>
                      [{a.code}] {a.region} ({a.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">장비 일련번호 (5자리)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={fileEquipNum}
                  onChange={(e) => setFileEquipNum(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">위반 일자 (YYYYMMDD)</label>
                <input
                  type="text"
                  value={fileDate}
                  onChange={(e) => setFileDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">위반 시간 (HHMMSS)</label>
                <input
                  type="text"
                  value={fileTime}
                  onChange={(e) => setFileTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">차로 번호 (2자리)</label>
                <input
                  type="text"
                  value={fileLane}
                  onChange={(e) => setFileLane(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">위반 유형 코드</label>
                <select
                  value={fileViolation}
                  onChange={(e) => setFileViolation(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {VIOLATION_CODES.map((v) => (
                    <option key={v.code} value={v.code}>
                      [{v.code}] {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">생성된 2026 표준 파일명</span>
              <div className="text-sm font-bold font-mono text-indigo-300 mt-1 break-all select-all">
                {generatedFilename}
              </div>
            </div>
          </div>

          {/* Reverse Parser */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              파일명 역해석기 (Reverse Parser)
            </h3>
            <p className="text-xs text-slate-400">
              기존 위반 파일명을 붙여넣으면 소속 경찰청, 장비, 일시, 위반행위를 즉시 해독합니다.
            </p>

            <div>
              <label className="block text-slate-400 mb-1 text-xs">해석할 파일명 입력</label>
              <input
                type="text"
                value={inputFilename}
                onChange={(e) => setInputFilename(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-emerald-500"
              />
            </div>

            {parsedResult.isValid ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="text-emerald-400 font-bold mb-2">✓ 규격 파일명 해독 성공</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">관할 경찰청:</span>
                  <span className="text-white font-medium">{parsedResult.agencyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">장비 일련번호:</span>
                  <span className="text-white font-mono">{parsedResult.equipNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">위반 일시:</span>
                  <span className="text-white font-mono">{parsedResult.date} {parsedResult.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">단속 차로:</span>
                  <span className="text-white font-mono">{parsedResult.lane}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">위반 행위:</span>
                  <span className="text-emerald-300 font-bold">{parsedResult.violation}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-800/60 text-xs text-rose-300">
                파일명 규격 불일치: 2026 표준 양식([청2+장비5]_[날짜]_[시간]_[차로]_[위반]_[순번].jpg)을 확인해주세요.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
