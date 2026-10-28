import React, { useState, useEffect } from 'react';
import { SPEC_CHAPTERS } from '../data/standardChapters';
import { DOCUMENT_META } from '../data/standardData';
import {
  BookOpen,
  Search,
  ChevronRight,
  Bookmark,
  ExternalLink,
  Table,
  CheckCircle,
  X,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SpecificationViewerProps {
  onOpenPdf: () => void;
  initialChapterId?: string;
  initialSectionId?: string;
  onClearInitialSection?: () => void;
}

type EquipmentFilterType = 'all' | 'fixed' | 'mobile' | 'vehicle' | 'drone' | 'protocol';

const EQUIPMENT_TAGS: { id: EquipmentFilterType; label: string }[] = [
  { id: 'all', label: '전체 조항' },
  { id: 'fixed', label: '고정식' },
  { id: 'mobile', label: '이동식' },
  { id: 'vehicle', label: '차량탑재형' },
  { id: 'drone', label: '드론탑재형' },
  { id: 'protocol', label: '통신·보안' },
];

const SUGGESTED_KEYWORDS = [
  '속도오차',
  '신호위반',
  '표 159',
  '시스템 비정상',
  '22바이트',
  '10초 녹화',
  '스테인리스',
  '16시간 챔버',
  '안내표지',
];

export const SpecificationViewer: React.FC<SpecificationViewerProps> = ({
  onOpenPdf,
  initialChapterId,
  initialSectionId,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId || SPEC_CHAPTERS[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(
    initialSectionId || SPEC_CHAPTERS[0].sections[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentFilterType>('all');
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>(['sec_1_1', 'sec_3_1']);
  const [highlightPulse, setHighlightPulse] = useState(false);

  // Sync when initial chapter/section props change (e.g. from Calculator or search navigation)
  useEffect(() => {
    if (initialChapterId) {
      setSelectedChapterId(initialChapterId);
    }
    if (initialSectionId) {
      setSelectedSectionId(initialSectionId);
      setHighlightPulse(true);
      const timer = setTimeout(() => setHighlightPulse(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [initialChapterId, initialSectionId]);

  const activeChapter = SPEC_CHAPTERS.find((c) => c.id === selectedChapterId) || SPEC_CHAPTERS[0];
  const activeSection =
    activeChapter.sections.find((s) => s.id === selectedSectionId) ||
    activeChapter.sections[0];

  const toggleBookmark = (secId: string) => {
    setBookmarkedSections((prev) =>
      prev.includes(secId) ? prev.filter((id) => id !== secId) : [...prev, secId]
    );
  };

  // Search and filter through all sections
  const filteredChapters = SPEC_CHAPTERS.map((ch) => {
    const filteredSections = ch.sections.filter((s) => {
      // Equipment filter
      if (selectedEquipment !== 'all') {
        const fullSecText = `${s.title} ${s.summary} ${s.content.join(' ')}`.toLowerCase();
        if (selectedEquipment === 'fixed' && !fullSecText.includes('고정식')) return false;
        if (selectedEquipment === 'mobile' && !fullSecText.includes('이동식')) return false;
        if (selectedEquipment === 'vehicle' && !fullSecText.includes('차량탑재') && !fullSecText.includes('차량 탑재')) return false;
        if (selectedEquipment === 'drone' && !fullSecText.includes('드론')) return false;
        if (selectedEquipment === 'protocol' && !fullSecText.includes('프로토콜') && !fullSecText.includes('tcp/ip') && !fullSecText.includes('보안') && !fullSecText.includes('opcode')) return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.content.some((c) => c.toLowerCase().includes(q)) ||
        s.keyStandards?.some((k) => k.label.toLowerCase().includes(q) || k.value.toLowerCase().includes(q)) ||
        s.tables?.some((t) => t.title.toLowerCase().includes(q) || t.number.toLowerCase().includes(q))
      );
    });

    return {
      ...ch,
      sections: filteredSections,
    };
  }).filter((ch) => ch.sections.length > 0);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <mark key={i} className="bg-amber-500/30 text-amber-200 px-1 py-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              경찰규격서 전문 전자 열람관
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {DOCUMENT_META.standardNumber} ({DOCUMENT_META.latestDate})
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              총 6개 장 및 부록 2종, 210쪽 분량의 최신 개정 기술규격을 조항별로 정밀 조회합니다.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 shadow transition"
        >
          <ExternalLink className="w-4 h-4 text-blue-400" />
          경찰청 원문 PDF 열람 (210쪽)
        </button>
      </div>

      {/* Main Grid: Sidebar & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Index (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[750px]">
          {/* Equipment Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 mb-2.5">
            {EQUIPMENT_TAGS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedEquipment(opt.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                  selectedEquipment === opt.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="조항, 단어 실시간 검색 (예: 갓길, 레이더, 암호화)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg text-xs text-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Suggested keyword chips */}
          <div className="flex flex-wrap items-center gap-1 mb-3">
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              추천:
            </span>
            {SUGGESTED_KEYWORDS.slice(0, 5).map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-blue-300"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Chapter & Section List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            {filteredChapters.length > 0 ? (
              filteredChapters.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div
                    onClick={() => {
                      setSelectedChapterId(ch.id);
                      if (ch.sections[0]) setSelectedSectionId(ch.sections[0].id);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                      selectedChapterId === ch.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">
                      {ch.number}. {ch.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ch.sections.length}절
                    </span>
                  </div>

                  {/* Sub sections if active chapter or searching */}
                  {(selectedChapterId === ch.id || searchQuery.trim() || selectedEquipment !== 'all') && (
                    <div className="pl-3 space-y-1 border-l-2 border-slate-800 ml-2">
                      {ch.sections.map((sec) => (
                        <div
                          key={sec.id}
                          onClick={() => {
                            setSelectedChapterId(ch.id);
                            setSelectedSectionId(sec.id);
                          }}
                          className={`px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition flex items-center justify-between ${
                            selectedSectionId === sec.id
                              ? 'bg-blue-600 text-white font-semibold shadow'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="truncate">
                            {sec.number} {sec.title}
                          </span>
                          {bookmarkedSections.includes(sec.id) && (
                            <Bookmark className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                일치하는 조항이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Section Content (8 cols) */}
        <div
          className={`lg:col-span-8 bg-slate-900/90 border rounded-2xl p-6 shadow-xl h-[750px] overflow-y-auto space-y-6 transition-all ${
            highlightPulse
              ? 'border-blue-500 ring-2 ring-blue-500/40 bg-slate-900'
              : 'border-slate-800'
          }`}
        >
          {activeSection ? (
            <div className="space-y-6">
              {/* Target Highlight Banner */}
              {highlightPulse && (
                <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-between text-xs text-blue-200 animate-pulse">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>성능검사 계산기에서 선택한 규격 조항이 로드되었습니다.</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/30 px-2 py-0.5 rounded">
                    {activeSection.number}
                  </span>
                </div>
              )}

              {/* Section Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                    <span>{activeChapter.number}. {activeChapter.title}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                    <span>{activeSection.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {highlightText(activeSection.title, searchQuery)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {highlightText(activeSection.summary, searchQuery)}
                  </p>
                </div>

                <button
                  onClick={() => toggleBookmark(activeSection.id)}
                  className={`p-2 rounded-lg border transition ${
                    bookmarkedSections.includes(activeSection.id)
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="중요 조항 책갈피"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarkedSections.includes(activeSection.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Key Standards Summary Badges if any */}
              {activeSection.keyStandards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeSection.keyStandards.map((std, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {highlightText(std.label, searchQuery)}
                        </div>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                          {highlightText(std.value, searchQuery)}
                        </div>
                        {std.note && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {highlightText(std.note, searchQuery)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paragraphs */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeSection.content.map((paragraph, idx) => (
                  <p key={idx} className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/60">
                    {highlightText(paragraph, searchQuery)}
                  </p>
                ))}
              </div>

              {/* Tables if any */}
              {activeSection.tables && activeSection.tables.map((tbl) => (
                <div key={tbl.id} className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white">
                      (표 {tbl.number}) {highlightText(tbl.title, searchQuery)}
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                        <tr>
                          {tbl.headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {tbl.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/30 transition">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3">
                                {typeof cell === 'string'
                                  ? highlightText(cell, searchQuery)
                                  : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {tbl.note && (
                    <p className="text-[11px] text-slate-500 italic">* {highlightText(tbl.note, searchQuery)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500">
              조항을 선택해 주십시오.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
