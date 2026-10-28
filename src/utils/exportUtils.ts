/**
 * 경찰청 무인교통단속장비 경찰규격서 (KPS-08-0004-02: 2026)
 * 내보내기, 보고서 생성 및 공유 유틸리티
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CalculationRecord {
  id: string;
  savedAt: string;
  equipmentId: string;
  equipmentType: 'fixed' | 'mobile' | 'vehicle' | 'drone';
  equipmentTypeName: string;
  location: string;
  inspector: string;
  agency: string;
  date: string;
  // Scores
  overallScore: number;
  isPassed: boolean;
  metrics: {
    speedScore: number;
    speedErrorRate: number;
    plateScore: number;
    plateRecognitionRate: number;
    captureScore: number;
    captureRate: number;
    commScore: number;
    commLatency: number;
    securityScore: number;
    isSecurityValid: boolean;
    durabilityScore: number;
    isDurabilityPassed: boolean;
  };
  notes?: string;
}

/**
 * JSON 파일로 다운로드
 */
export function downloadJson(data: unknown, filename: string): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * 텍스트 파일로 다운로드
 */
export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * HTML 요소를 캡처하여 PDF로 다운로드
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string,
  documentTitle = '성능검사 판정 보고서'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.setProperties({
      title: documentTitle,
      subject: '경찰청 무인교통단속장비 경찰규격서(KPS-08-0004-02: 2026) 성능검사',
      author: '경찰청 교통안전과 성능검사시스템',
      creator: 'NPA Traffic Enforcement Portal',
    });

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
}

/**
 * 경찰청 공식 성능검사 성적서 텍스트 생성 (KPS-08-0004-02: 2026 기준)
 */
export function generateOfficialReportText(record: CalculationRecord): string {
  const line = '='.repeat(70);
  const subLine = '-'.repeat(70);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return `
${line}
      경찰청 무인교통단속장비 성능검사 결과 통보서 (공식 서식)
  근거: 경찰규격서 KPS-08-0004-02 (2026.02.25 개정) 및 도로교통법 제4조의2
${line}

1. 검사 기본 정보
${subLine}
- 문 서 번 호 : NPA-TES-${record.id.slice(0, 8).toUpperCase()}
- 발 행 일 시 : ${now}
- 검 사 일 자 : ${record.date}
- 검 사 기 관 : ${record.agency || '도로교통공단 교통안전인증처'}
- 수 행 검 사 원 : ${record.inspector || '공인검사관'}
- 입 회 관 : 경찰청 교통안전과 단속장비담당관

2. 대상 장비 제원
${subLine}
- 장 비 종 류 : ${record.equipmentTypeName} (${record.equipmentType.toUpperCase()})
- 장 비 관 리 번 호 : ${record.equipmentId}
- 설 치 위 치 : ${record.location}
- 적용 규격 버전 : KPS-08-0004-02 (2026년 최신 규격)

3. 6대 핵심 성능 항목별 검사 결과 및 규격 충족도
${subLine}
[1] 속도 검지 정확도 (도로교통법 제17조)
  · 규격 기준: 60km/h 미만 ±3km/h 이하 / 100km/h 이상 ±5% 이하
  · 실측 오차율: ${record.metrics.speedErrorRate.toFixed(2)}%
  · 획득 점수: ${record.metrics.speedScore} / 100점
  · 판정: ${record.metrics.speedScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

[2] 차량번호판 인식률 (국토교통부 자동차등록번호판 기준 고시)
  · 규격 기준: 번호인식률 ≥ 85%, 번호인식 오류율 < 2.0%
  · 실측 인식률: ${record.metrics.plateRecognitionRate.toFixed(2)}%
  · 획득 점수: ${record.metrics.plateScore} / 100점
  · 판정: ${record.metrics.plateScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

[3] 위반차량 단속 및 캡처 검지율 (단속률 규격)
  · 규격 기준: 위반차량 단속률 ≥ 80.0%, 위반행위 구분율 ≥ 90.0%
  · 실측 검지율: ${record.metrics.captureRate.toFixed(2)}%
  · 획득 점수: ${record.metrics.captureScore} / 100점
  · 판정: ${record.metrics.captureScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

[4] 통신 프로토콜 응답성 및 무결성 (2026 표준 헤더 22B)
  · 규격 기준: 0x9898 프레임 정합, 응답지연 < 1,000ms, 손실률 0%
  · 실측 지연: ${record.metrics.commLatency} ms
  · 획득 점수: ${record.metrics.commScore} / 100점
  · 판정: ${record.metrics.commScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

[5] 데이터 암호화 및 위변조 방지 (SHA-256 / AES-256)
  · 규격 기준: 이미지 해시 64Byte 불일치 0건, 위변조 검증 통과
  · 무결성 검증: ${record.metrics.isSecurityValid ? '정상 검증 (무결성 확인)' : '검증 실패 (해시 불일치)'}
  · 획득 점수: ${record.metrics.securityScore} / 100점
  · 판정: ${record.metrics.securityScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

[6] 환경적응성 및 내구성 시험 (16시간 -30℃ ~ +60℃ 챔버 및 방수 IP66)
  · 규격 기준: 극한 온도 복원력 정상, 방수·방진 IP66 이상
  · 시험 상태: ${record.metrics.isDurabilityPassed ? '챔버 및 내구성 전 항목 통과' : '환경시험 기준 미달'}
  · 획득 점수: ${record.metrics.durabilityScore} / 100점
  · 판정: ${record.metrics.durabilityScore >= 80 ? '적합 (PASS)' : '부적합 (FAIL)'}

4. 최종 종합 평가 결과
${subLine}
- 종합 환산 점수 : ${record.overallScore.toFixed(1)} / 100.0 점
- 최종 합격 판정 : 【 ${record.isPassed ? '적 합 (합격 / 설치 및 운영 승인)' : '부 적 합 (불합격 / 재검사 필요)'} 】
- 규격 준수율 : ${record.isPassed ? '100% 충족' : '일부 항목 미달'}
- 특 이 사 항 : ${record.notes || '특이사항 없음. 정상 운영 규격 만족.'}

5. 검사 확인 및 날인
${subLine}
위 장비는 경찰청 고시 무인교통단속장비 경찰규격서(KPS-08-0004-02: 2026.02.25 개정)에
따라 시행된 성능검사에서 위와 같이 판정되었음을 공식 증명합니다.

검 사 기 관 : ${record.agency || '도로교통공단 (KoROAD)'} [직인생략]
검  사  원 : ${record.inspector || '공인시험관'} (서명/인)
${line}
`;
}

/**
 * 클립보드 및 메신저용 요약 텍스트 생성
 */
export function generateShareableSummaryText(record: CalculationRecord): string {
  const statusEmoji = record.isPassed ? '✅ [적합]' : '❌ [부적합]';
  return `[경찰청 무인단속장비 성능검사 결과]
${statusEmoji} ${record.equipmentTypeName} (${record.equipmentId})
- 검사일시: ${record.date}
- 설치위치: ${record.location}
- 종합점수: ${record.overallScore.toFixed(1)}점 / 100점
- 최종판정: ${record.isPassed ? '적합 (승인)' : '부적합 (보완요망)'}
- 속도오차율: ${record.metrics.speedErrorRate.toFixed(2)}% (${record.metrics.speedScore}점)
- 번호인식률: ${record.metrics.plateRecognitionRate.toFixed(2)}% (${record.metrics.plateScore}점)
- 단속검지율: ${record.metrics.captureRate.toFixed(2)}% (${record.metrics.captureScore}점)
- 프로토콜/보안: ${record.metrics.commScore}점 / ${record.metrics.securityScore}점
- 검사기관/원: ${record.agency} (${record.inspector})
* 규격근거: KPS-08-0004-02 (2026.02.25 개정)`;
}

/**
 * 이메일 공유 링크(mailto) URL 생성
 */
export function generateShareableEmailTemplate(
  record: CalculationRecord,
  recipient = ''
): string {
  const subject = `[경찰규격서 검사보고] ${record.equipmentId} (${record.equipmentTypeName}) 성능검사 ${record.isPassed ? '적합' : '부적합'} 판정`;
  const body = generateOfficialReportText(record);
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
