import { useState, useCallback, useMemo } from 'react';
import type { ColDef, FilterDef } from '../types';

function parseTerms(val: string): Set<string> {
  return new Set(
    val.split(/[\n,]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0),
  );
}

export function useTableFilters<T extends object>(
  allRows: T[],
  filterDefs: FilterDef[],
  cols: ColDef[],
) {
  const [filterText, setFilterText] = useState<Record<string, string>>(() =>
    Object.fromEntries(filterDefs.map(d => [d.key, ''])),
  );
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortCol, setSortCol]   = useState<number | null>(null);
  const [sortDir, setSortDir]   = useState<1 | -1>(1);

  const filterMap = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    filterDefs.forEach(d => { m[d.key] = parseTerms(filterText[d.key] ?? ''); });
    return m;
  }, [filterText, filterDefs]);

  const activeFilters = useMemo(
    () => filterDefs.filter(d => filterMap[d.key].size > 0),
    [filterMap, filterDefs],
  );

  const filtered = useMemo(() => {
    let rows = allRows.filter(row => {
      const r = row as Record<string, unknown>;
      for (const d of activeFilters) {
        const cell = String(r[d.col] ?? '').toLowerCase();
        if (![...filterMap[d.key]].some(t => cell.includes(t))) return false;
      }
      return true;
    });

    if (sortCol !== null) {
      const colKey = cols[sortCol]?.key;
      if (colKey) {
        rows = [...rows].sort((a, b) => {
          const ar = a as Record<string, unknown>, br = b as Record<string, unknown>;
          const av = String(ar[colKey] ?? '').toLowerCase();
          const bv = String(br[colKey] ?? '').toLowerCase();
          const an = parseFloat(av), bn = parseFloat(bv);
          if (!isNaN(an) && !isNaN(bn)) return (an - bn) * sortDir;
          return av < bv ? -sortDir : av > bv ? sortDir : 0;
        });
      }
    }
    return rows;
  }, [allRows, activeFilters, filterMap, sortCol, sortDir, cols]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    if (!isFinite(pageSize)) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const setFilter = useCallback((key: string, val: string) => {
    setFilterText(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterText(Object.fromEntries(filterDefs.map(d => [d.key, ''])));
    setPage(1);
  }, [filterDefs]);

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
    filterText, filterMap, filtered: filtered as T[],
    pageRows: pageRows as T[], page, pageSize, totalPages,
    sortCol, sortDir,
    setFilter, clearFilters, sort, goPage, changePageSize,
  };
}
