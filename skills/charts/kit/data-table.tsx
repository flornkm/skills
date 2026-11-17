import type { CSSProperties, ReactNode } from "react";

// Hidden from sight but read by screen readers. Not `display: none`, which hides it from both.
const VISUALLY_HIDDEN: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export type DataTableColumn<Row> = {
  header: string;
  // Formatted for people, the same way the tooltip formats it ("$1,200", "Not tracked").
  cell: (row: Row) => ReactNode;
};

// The whole dataset as a real table, built from the same rows the chart draws. Screen reader
// users get every value, not one point at a time. Pass `visible` to render it for everyone, for
// example behind a "View as table" toggle.
export function ChartDataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  visible = false,
  className,
}: {
  caption: string;
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row, index: number) => string;
  visible?: boolean;
  className?: string;
}) {
  return (
    <table style={visible ? undefined : VISUALLY_HIDDEN} className={className}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={rowKey(row, i)}>
            {columns.map((column, c) =>
              c === 0 ? (
                <th key={column.header} scope="row">
                  {column.cell(row)}
                </th>
              ) : (
                <td key={column.header}>{column.cell(row)}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
