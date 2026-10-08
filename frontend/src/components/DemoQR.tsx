import React from "react";

export function DemoQR({ seed }: any) {
  const N = 29;
  let s = Math.floor(seed * 100) + 7;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    for (const [r0, c0] of [
      [0, 0],
      [0, N - 7],
      [N - 7, 0],
    ]) {
      if (inBox(r0, c0)) {
        const y = r - r0,
          x = c - c0;
        return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4) ? 1 : 0;
      }
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0;
    }
    return null;
  };
  const cells = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const f = finder(r, c);
      if (f === 1 || (f === null && rnd() > 0.52))
        cells.push(<rect key={r + "-" + c} x={c} y={r} width={1} height={1} />);
    }
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className="w-full h-full" role="img" aria-label="Demo payment QR code">
      <rect x={-2} y={-2} width={N + 4} height={N + 4} fill="#fff" />
      <g fill="#0a0a0a">{cells}</g>
    </svg>
  );
}

/* =========================================================
   ORDER SUMMARY
   ========================================================= */
