import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Table as TableIcon,
  ShieldCheck,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { SPEC_CHAPTERS } from '../data/standardChapters';
import { DOCUMENT_META } from '../data/standardData';
import { SpecChapter, SpecSection } from '../types/standard';

interface SpecificationViewerProps {
  onOpenPdf: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const SpecificationViewer: React.FC<SpecificationViewerProps> = ({
  onOpenPdf,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(SPEC_CHAPTERS[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(SPEC_CHAPTERS[0].sections[0].id);
  const [bookmarks, setBookmarks] = useState<string[]>(['ch2-3', 'ch3-3', 'ch4-1']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const results: { chapter: SpecChapter; section: SpecSection; matches: string[] }[] = [];

    SPEC_CHAPTERS.forEach((chapter) => {
      chapter.sections.forEach((section) => {
        const matches: string[] = [];
        if (section.title.toLowerCase().includes(q)) matches.push(`제목: ${section.title}`);
        if (section.summary.toLowerCase().includes(q)) matches.push(`요약: ${section.summary}`);
        section.content.forEach((line) => {
          if (line.toLowerCase().includes(q)) {
            matches.push(line);
          }
        });
        if (section.tables) {
          section.tables.forEach((t) => {
            if (t.title.toLowerCase().includes(q)) matches.push(`표: ${t.title}`);
          });
        }
        if (matches.length > 0) {
          results.push({ chapter, section, matches: matches.slice(0, 3) });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const currentChapter = SPEC_CHAPTERS.find((c) => c.id === selectedChapterId) || SPEC_CHAPTERS[0];
  const currentSection =
    currentChapter.sections.find((s) => s.id === selectedSectionId) || currentChapter.sections[0];

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Document Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 mb-1.5">
              <span className="font-mono tracking-wider bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">
                {DOCUMENT_META.standardNumber}
              </span>
              <span>·</span>
              <span>{DOCUMENT_META.authority}</span>
              <span>·</span>
              <span>최신 개정일 {DOCUMENT_META.latestDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {DOCUMENT_META.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {DOCUMENT_META.englishTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRevisionHistory(!showRevisionHistory)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>연혁 및 개정 이력 ({DOCUMENT_META.revisionHistory.length}회)</span>
            </button>
            <button
              onClick={onOpenPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>원문 규격서 열람</span>
            </button>
          </div>
        </div>

        {/* Legal Basis & Quick Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">법적 근거</span>
            <span className="font-semibold text-slate-800">{DOCUMENT_META.legalBasis}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">단속 대상 기능</span>
            <span className="font-semibold text-slate-800">속도·신호·꼬리물기 등 11종</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">통신 프로토콜</span>
            <span className="font-semibold text-slate-800 font-mono">TCP/IP (Big-Endian, 포트 8701~8804)</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">공인 시험 기관</span>
            <span className="font-semibold text-slate-800">한국도로교통공단 / KOLAS 인정기관</span>
          </div>
        </div>

        {/* Revision History Collapsible */}
        {showRevisionHistory && (
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                경찰규격서 제정 및 개정 연월일 이력
              </h4>
              <span className="text-xs text-slate-500">1998년 최초 제정 ~ 2026년 최신 개정</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {DOCUMENT_META.revisionHistory.map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded p-2 text-xs"
                >
                  <span className="font-mono font-medium text-slate-900 block">{rev.date}</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{rev.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="규격서 조항, 성능기준, 프로토콜, 표 검색 (예: 안전모, 꼬리물기, 0x21, 챔버, 보도통행, 표 6...)"
          className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
          >
            검색 초기화
          </button>
        )}
      </div>

      {/* Search Results Display */}
      {searchResults !== null ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              '{searchQuery}' 검색 결과 ({searchResults.length}건)
            </h3>
            <span className="text-xs text-slate-400">결과 클릭 시 해당 조항으로 즉시 이동합니다</span>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">검색 결과가 없습니다.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedChapterId(res.chapter.id);
                    setSelectedSectionId(res.section.id);
                    setSearchQuery('');
                  }}
                  className="py-3 cursor-pointer hover:bg-blue-50/50 -mx-3 px-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1">
                    <span>{res.chapter.number}. {res.chapter.title}</span>
                    <span>➔</span>
                    <span className="font-semibold text-slate-800">{res.section.number}. {res.section.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{res.section.summary}</p>
                  <div className="space-y-1">
                    {res.matches.map((m, mi) => (
                      <p key={mi} className="text-xs text-slate-700 bg-slate-50 rounded px-2 py-1 font-mono">
                        {m}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Two Column Layout: Navigation on Left, Article Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Chapters & Sections Directory */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              규격서 목차 네비게이션
            </h3>
            <span className="text-xs text-slate-400">{SPEC_CHAPTERS.length}개 장</span>
          </div>

          <div className="space-y-3">
            {SPEC_CHAPTERS.map((chapter) => {
              const isChapterSelected = chapter.id === selectedChapterId;
              return (
                <div key={chapter.id} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedChapterId(chapter.id);
                      setSelectedSectionId(chapter.sections[0].id);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      isChapterSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {chapter.number}. {chapter.title}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isChapterSelected ? 'rotate-90 text-blue-400' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {isChapterSelected && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {chapter.sections.map((section) => {
                        const isSectionSelected = section.id === selectedSectionId;
                        const isBookmarked = bookmarks.includes(section.id);
                        return (
                          <div
                            key={section.id}
                            className={`flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                              isSectionSelected
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                            onClick={() => setSelectedSectionId(section.id)}
                          >
                            <span className="truncate pr-2">
                              {section.number}. {section.title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {section.tables && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  표
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(section.id);
                                }}
                                className="text-slate-400 hover:text-amber-500 p-0.5"
                                title="북마크"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Shortcuts to Interactive Tools */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              연계 전문 분석기
            </span>
            <button
              onClick={() => onNavigateToTab('calculator')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between"
            >
              <span>성능검사 판정 계산기 (1~5년차)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigateToTab('protocol')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between"
            >
              <span>TCP/IP 패킷 & 파일명 분석기</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigateToTab('durability')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between"
            >
              <span>16시간 챔버 환경시험 프로파일</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </aside>

        {/* Right Column: Article Reading View */}
        <main className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 lg:p-8 shadow-xs">
          {/* Section Breadcrumb & Actions */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-800">{currentChapter.number}. {currentChapter.title}</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{currentSection.number}. {currentSection.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBookmark(currentSection.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                {bookmarks.includes(currentSection.id) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>북마크됨</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>북마크</span>
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  handleCopyText(
                    `${currentSection.title}\n${currentSection.summary}\n\n${currentSection.content.join('\n')}`,
                    currentSection.id
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                title="조항 내용 복사"
              >
                {copiedId === currentSection.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Heading */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentSection.number}. {currentSection.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
              {currentSection.summary}
            </p>
          </div>

          {/* Key Standards Callout if any */}
          {currentSection.keyStandards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentSection.keyStandards.map((ks, i) => (
                <div key={i} className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs">
                  <span className="text-blue-800 font-semibold block">{ks.label}</span>
                  <span className="text-slate-900 font-mono mt-0.5 block">{ks.value}</span>
                  {ks.note && <span className="text-slate-500 text-[11px] block mt-0.5">{ks.note}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-sans mb-8">
            {currentSection.content.map((paragraph, idx) => (
              <p key={idx} className="text-justify">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Section Tables */}
          {currentSection.tables && currentSection.tables.length > 0 && (
            <div className="space-y-6 mb-8">
              {currentSection.tables.map((table) => (
                <div key={table.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                      <TableIcon className="w-4 h-4 text-blue-400" />
                      {table.number} : {table.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">경찰청 규격</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 font-semibold text-slate-700">
                        <tr>
                          {table.headers.map((h, hi) => (
                            <th key={hi} className="px-4 py-2.5 text-left border-r last:border-r-0 border-slate-200 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {table.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50/70 transition-colors">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-2.5 text-slate-800 border-r last:border-r-0 border-slate-100">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {table.note && (
                    <div className="px-4 py-2 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-200">
                      {table.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Next / Previous Section Navigation */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                const allSections = SPEC_CHAPTERS.flatMap((c) => c.sections);
                const curIdx = allSections.findIndex((s) => s.id === currentSection.id);
                if (curIdx > 0) {
                  const prevSec = allSections[curIdx - 1];
                  const ch = SPEC_CHAPTERS.find((c) => c.sections.some((s) => s.id === prevSec.id));
                  if (ch) {
                    setSelectedChapterId(ch.id);
                    setSelectedSectionId(prevSec.id);
                  }
                }
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              ← 이전 조항
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {currentSection.number} / {currentChapter.sections.length}
            </span>

            <button
              onClick={() => {
                const allSections = SPEC_CHAPTERS.flatMap((c) => c.sections);
                const curIdx = allSections.findIndex((s) => s.id === currentSection.id);
                if (curIdx < allSections.length - 1) {
                  const nextSec = allSections[curIdx + 1];
                  const ch = SPEC_CHAPTERS.find((c) => c.sections.some((s) => s.id === nextSec.id));
                  if (ch) {
                    setSelectedChapterId(ch.id);
                    setSelectedSectionId(nextSec.id);
                  }
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              다음 조항 →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
