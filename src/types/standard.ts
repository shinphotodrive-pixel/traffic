/**
 * 경찰청 무인교통단속장비 경찰규격서 (KPS-08-0004-02: 2026.02.25) 타입 정의
 */

export type EquipmentCategory = 'fixed' | 'mobile' | 'vehicle' | 'drone';

export interface SpecChapter {
  id: string;
  number: string;
  title: string;
  subTitle?: string;
  sections: SpecSection[];
}

export interface SpecSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  content: string[];
  tables?: SpecTable[];
  figures?: SpecFigure[];
  keyStandards?: { label: string; value: string; note?: string }[];
}

export interface SpecTable {
  id: string;
  number: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  note?: string;
}

export interface SpecFigure {
  id: string;
  number: string;
  title: string;
  description: string;
  caption?: string;
}

export interface EnforcementFunction {
  id: string;
  name: string;
  legalBasis: string;
  fixed: boolean;
  mobile: boolean;
  vehicle: boolean;
  drone: boolean;
  droneNote?: string;
  description: string;
  criteriaSummary: string;
  samplingStandard: string;
  keyMetric: string;
  targetTolerance: string;
}

export interface OpcodeItem {
  code: string; // e.g. "0x10", "0x21", "0x34", "'95'", "'98'"
  name: string;
  category: '정보수집' | '원격제어' | '차적조회';
  port: number;
  client: '지역제어장치' | '센터통신서버';
  server: '지역제어장치' | '센터통신서버';
  direction: string;
  description: string;
  requestPacket?: {
    lengthDesc: string;
    fields: { name: string; size: string; type: string; desc: string }[];
  };
  responsePacket?: {
    lengthDesc: string;
    fields: { name: string; size: string; type: string; desc: string }[];
  };
}

export interface PoliceAgencyCode {
  code: string;
  name: string;
  region: string;
}

export interface ViolationCode {
  code: string;
  name: string;
  category: string;
  description: string;
}

export interface SystemAbnormalItem {
  no: number;
  title: string;
  description: string;
  appliesTo: string;
}

export interface DurabilityTestSpec {
  id: string;
  name: string;
  category: '외관' | '기능' | '환경' | '진동' | '내수성' | '전기' | '광학';
  applicable: { fixed: boolean; mobile: boolean };
  sampleRatio: string;
  method: string;
  criteria: string;
  standardsRef?: string;
}

export interface SignageDistanceRule {
  roadType: string;
  speedLimit: string;
  firstNoticeDist: string;
  secondNoticeDist: string;
  note?: string;
}
