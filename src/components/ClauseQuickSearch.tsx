import React, { useState, useMemo } from 'react';
import { SEARCHABLE_CLAUSES, SearchableClause, EquipmentTag } from '../data/clauseSearchData';
import {
  Search,
  X,
  BookOpen,
  Copy,
  Check,
  CheckCircle2,
  Filter,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ClauseQuickSearchProps {
  onNavigateToSpec?: (chapterId: string, sectionId: string) => void;
  onApplyCriteria?: (category: string) => void;
  initialEquipment?: EquipmentTag;
  placeholder?: string;
  defaultExpanded?: boolean;
}

const EQUIPMENT_OPTIONS: { id: EquipmentTag; label: string; badgeColor: string }[] = [
  { id: 'all', label: '전체 장비', badgeColor: 'bg-slate-700 text-slate-200' },
  { id: 'fixed', label: '고정식', badgeColor: 'bg-blue-600/20 text-blue-400 border border-blue-500/30' },
  { id: 'mobile', label: '이동식', badgeColor: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' },
  { id: 'vehicle', label: '차량탑재형', badgeColor: 'bg-purple-600/20 text-purple-400 border border-purple-500/30' },
  { id: 'drone', label: '드론탑재형', badgeColor: 'bg-amber-600/20 text-amber-400 border border-amber-500/30' },
];

const QUICK_TAGS = [
  '속도오차 ±5%',
  '신호위반 0% 오류율',
  '시스템 비정상 11개 조항',
  '번호인식률 85%',
  '통신 22바이트 헤더',
  '16시간 온·습도 챔버',
  '단속 전후 10초 녹화',
  '안내표지 이격거리',
];

export const ClauseQuickSearch: React.FC<ClauseQuickSearchProps> = ({
  onNavigateToSpec,
  onApplyCriteria,
  initialEquipment = 'all',
  placeholder = '특정 단속장비 관련 규격 조항 실시간 검색 (예: 속도오차, 신호위반, 10초 녹화, 22바이트)...',
  defaultExpanded = true,
}) => {
  const [query, setQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentTag>(initialEquipment);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter clauses real-time
  const filteredClauses = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    return SEARCHABLE_CLAUSES.filter((clause) => {
      // Equipment filter
      if (selectedEquipment !== 'all') {
        const matchesEquip =
          clause.equipmentTypes.includes('all') ||
          clause.equipmentTypes.includes(selectedEquipment);
        if (!matchesEquip) return false;
      }

      // Query filter
      if (!trimmed) return true;

      const titleMatch = clause.title.toLowerCase().includes(trimmed);
      const clauseNumMatch = clause.clauseNumber.toLowerCase().includes(trimmed);
      const summaryMatch = clause.summary.toLowerCase().includes(trimmed);
      const contentMatch = clause.contentSnippet.toLowerCase().includes(trimmed);
      const keyCriteriaMatch = clause.keyCriteria?.toLowerCase().includes(trimmed);
      const keywordMatch = clause.keywords.some((k) => k.toLowerCase().includes(trimmed));

      return (
        titleMatch ||
        clauseNumMatch ||
        summaryMatch ||
        contentMatch ||
        keyCriteriaMatch ||
        keywordMatch
      );
    });
  }, [query, selectedEquipment]);

  const handleCopyCitation = (clause: SearchableClause, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[경찰규격서 ${clause.clauseNumber}] ${clause.title}\n• 주요기준: ${clause.keyCriteria || clause.summary}\n• 원문발췌: ${clause.contentSnippet}`;
    navigator.clipboard.writeText(text);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.trim().toLowerCase() ? (
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              무인교통단속장비 규격 조항 실시간 검색
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {filteredClauses.length}개 조항 검색됨
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              고정식·이동식·차량탑재형·드론탑재형 등 장비별 성능기준 및 조항 전문 실시간 조회
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-end md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
        >
          {isExpanded ? (
            <>
              <span>검색창 접기</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>검색창 펼치기</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-blue-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
                title="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Equipment Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              장비 구분:
            </span>
            {EQUIPMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedEquipment(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedEquipment === opt.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 scale-105'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Quick Search Preset Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              자주 찾는 규격:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag.split(' ')[0]);
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-300 hover:border-blue-500/40 hover:bg-slate-900 transition"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 pt-1 no-scrollbar">
            {filteredClauses.length > 0 ? (
              filteredClauses.map((clause) => {
                const isCopied = copiedId === clause.id;
                return (
                  <div
                    key={clause.id}
                    className="p-3.5 bg-slate-950/70 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl transition space-y-2 group"
                  >
                    {/* Top Row: Clause Number & Equipment Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold font-mono border border-blue-500/30">
                          {clause.clauseNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition">
                          {highlightMatch(clause.title, query)}
                        </h4>
                      </div>

                      {/* Equipment Tags */}
                      <div className="flex items-center gap-1">
                        {clause.equipmentTypes.map((eq) => {
                          const opt = EQUIPMENT_OPTIONS.find((o) => o.id === eq);
                          if (!opt || eq === 'all') return null;
                          return (
                            <span
                              key={eq}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${opt.badgeColor}`}
                            >
                              {opt.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Key Requirement Callout */}
                    {clause.keyCriteria && (
                      <div className="px-2.5 py-1.5 bg-blue-950/30 border border-blue-900/40 rounded-lg flex items-start gap-2 text-xs text-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">
                          {highlightMatch(clause.keyCriteria, query)}
                        </span>
                      </div>
                    )}

                    {/* Excerpt Snippet */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {highlightMatch(clause.contentSnippet, query)}
                    </p>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{clause.chapterNumber}장</span>
                        <span>•</span>
                        <span>{clause.summary.slice(0, 36)}...</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleCopyCitation(clause, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                            isCopied
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
                          }`}
                          title="조항 인용구 복사"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>규격 복사</span>
                            </>
                          )}
                        </button>

                        {onNavigateToSpec && (
                          <button
                            onClick={() =>
                              onNavigateToSpec(clause.chapterId, clause.sectionId)
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition"
                            title="규격서 전문 열람관으로 바로 이동"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>전문 열람관에서 조항 열기</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                <Search className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">
                  "{query}" 와 일치하는 규격 조항이 없습니다.
                </p>
                <p className="text-[11px] text-slate-500">
                  속도오차, 신호위반, 10초 녹화, 22바이트, 챔버, 비정상 등 다른 키워드로 검색해 보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
