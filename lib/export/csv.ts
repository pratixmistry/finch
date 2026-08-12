// Client-side only — builds a CSV in memory and triggers a browser download.
// Never touches the network, so there's no upload/exfiltration concern here.

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map((cell) => escapeCsvField(String(cell))).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
