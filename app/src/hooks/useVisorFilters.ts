import { useState, useCallback, useMemo } from 'react';
import type { InventoryRow } from '../types';
import { FILTER_DEFS, VCOLS } from '../lib/constants';

type FilterText = Record<string, string>;

function parseTerms(val: string): Set<string> {
  return new Set(
    val.split(/[\n,]+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0),
  );
}

export function useVisorFilters(allRows: InventoryRow[]) {
  const [filterText, setFilterText] = useState<FilterText>(() =>
    Object.fromEntries(FILTER_DEFS.map(d => [d.key, ''])),
  );
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortCol, setSortCol]   = useState<number | null>(null);
  const [sortDir, setSortDir]   = useState<1 | -1>(1);

  const filterMap = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    FILTER_DEFS.forEach(d => { m[d.key] = parseTerms(filterText[d.key] ?? ''); });
    return m;
  }, [filterText]);

  const activeFilters = useMemo(
    () => FILTER_DEFS.filter(d => filterMap[d.key].size > 0),
    [filterMap],
  );

  const filtered = useMemo(() => {
    let rows = allRows.filter(row => {
      for (const d of activeFilters) {
        const cell = (row[d.col] ?? '').toLowerCase();
        if (![...filterMap[d.key]].some(t => cell.includes(t))) return false;
      }
      return true;
    });

    if (sortCol !== null) {
      const colKey = VCOLS[sortCol].key;
      rows = [...rows].sort((a, b) => {
        const av = (a[colKey] ?? '').toLowerCase();
        const bv = (b[colKey] ?? '').toLowerCase();
        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      });
    }
    return rows;
  }, [allRows, activeFilters, filterMap, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const setFilter = useCallback((key: string, val: string) => {
    setFilterText(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterText(Object.fromEntries(FILTER_DEFS.map(d => [d.key, ''])));
    setPage(1);
  }, []);

  const sort = useCallback((ci: number) => {
    setSortCol(prev => {
      if (prev === ci) { setSortDir(d => (d === 1 ? -1 : 1)); return ci; }
      setSortDir(1); return ci;
    });
    setPage(1);
  }, []);

  const goPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const changePageSize = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return {
    filterText,
    filterMap,
    filtered,
    pageRows,
    page,
    pageSize,
    totalPages,
    sortCol,
    sortDir,
    setFilter,
    clearFilters,
    sort,
    goPage,
    changePageSize,
  };
}
