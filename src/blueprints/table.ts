import type { ComponentConfig, ComponentResult, ColumnConfig } from "../types/index.js";

export function generateTable(config: ComponentConfig): ComponentResult {
  const name = config.name || "DataTable";
  const color = config.color || "blue";
  const columns = config.columns || [
    { key: "name", label: "Name", sortable: true } as ColumnConfig,
    { key: "value", label: "Value" } as ColumnConfig,
  ];
  const rows = config.rows || [];
  const emptyText = config.emptyText || "No data available.";
  const colsJson = JSON.stringify(columns.map(c => ({ key: c.key, label: c.label, sortable: c.sortable || false, width: c.width || undefined })));

  const props = `export interface ${name}Props {
  columns?: { key: string; label: string; sortable?: boolean; width?: string }[];
  rows?: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  className?: string;
  loading?: boolean;
  emptyText?: string;
}`;

  const code = `import React, { useState, useMemo } from 'react';

${props}

export default function ${name}({
  columns: cols = ${colsJson},
  rows: data = [],
  onRowClick,
  className = '',
  loading = false,
  emptyText = '${emptyText}',
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (col) => {
    if (!col.sortable) return null;
    const active = sortConfig?.key === col.key;
    return (
      <span className="inline-flex flex-col leading-none ml-1.5 -mr-1">
        <svg
          className={['w-3 h-3 -mb-0.5 transition-colors', active && sortConfig.direction === 'asc' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'].join(' ')}
          fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <svg
          className={['w-3 h-3 -mt-0.5 transition-colors', active && sortConfig.direction === 'desc' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'].join(' ')}
          fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
        >
          <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    );
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    onRowClick?.(row);
  };

  const renderCell = (row, col) => {
    const value = row[col.key];
    if (col.render) return col.render(value, row);
    if (typeof value === 'boolean') {
      return (
        <span className={['inline-flex items-center justify-center w-5 h-5 rounded-full', value ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'].join(' ')}>
          {value ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </span>
      );
    }
    if (value === null || value === undefined) return <span className="text-gray-400 italic">—</span>;
    return value;
  };

  return (
    <div className={['overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm', className].filter(Boolean).join(' ')}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80">
              {cols.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={[
                    'px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider',
                    'text-gray-500 dark:text-gray-400',
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors' : '',
                    col.width || '',
                  ].join(' ')}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {getSortIcon(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {cols.map((col) => (
                    <td key={col.key} className="px-5 py-3.5">
                      <div className={['h-4 rounded bg-gray-200 dark:bg-gray-700', idx % 2 === 0 ? 'w-3/4' : 'w-1/2'].join(' ')} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedRows.length > 0 ? (
              sortedRows.map((row, idx) => {
                const isSelected = selectedRow === row;
                return (
                  <tr
                    key={row.id || idx}
                    onClick={() => handleRowClick(row)}
                    className={[
                      'transition-all duration-150',
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30',
                      onRowClick ? 'cursor-pointer' : '',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-200 dark:ring-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/60',
                    ].join(' ')}
                  >
                    {cols.map((col) => (
                      <td
                        key={col.key}
                        className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={cols.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
                    {data.length === 0 && !loading && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Add rows to the <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">rows</code> prop to display data</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sortedRows.length > 0 && (
        <div className="px-5 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>{sortedRows.length} row{sortedRows.length !== 1 ? 's' : ''}</span>
          {sortConfig && (
            <span>
              Sorted by <strong className="text-gray-700 dark:text-gray-300">{cols.find(c => c.key === sortConfig.key)?.label || sortConfig.key}</strong>
              {' '}({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
            </span>
          )}
        </div>
      )}
    </div>
  );
}`;

  return { componentName: name, code, props, dependencies: [] };
}
