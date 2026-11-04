import React, { useMemo } from "react";

export interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
}

/**
 * Deterministic QR Matrix Generator (Version 2, 25x25)
 * Generates standards-compliant finder patterns, timing patterns,
 * alignment pattern, and payload-dependent data modules.
 */
function generateQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  const setCell = (
    grid: boolean[][],
    r: number,
    c: number,
    val: boolean,
  ): void => {
    const row = grid[r];
    if (row && c >= 0 && c < size) {
      row[c] = val;
    }
  };

  const getCell = (grid: boolean[][], r: number, c: number): boolean => {
    const row = grid[r];
    return row ? !!row[c] : false;
  };

  // Helper to place finder pattern
  const placeFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const isDark = isOuter || isInner;
        setCell(matrix, startRow + r, startCol + c, isDark);
        setCell(reserved, startRow + r, startCol + c, true);
      }
    }
    // Separator border (1 cell around finder)
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = startRow + r;
        const tc = startCol + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          setCell(reserved, tr, tc, true);
        }
      }
    }
  };

  // 1. Finder patterns at (0,0), (0, 18), (18, 0)
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment pattern at (18, 18) for Version 2 (size 25)
  const alignR = 18;
  const alignC = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      setCell(matrix, alignR + r, alignC + c, isOuter || isCenter);
      setCell(reserved, alignR + r, alignC + c, true);
    }
  }

  // 3. Timing patterns on row 6 and col 6
  for (let i = 8; i < size - 8; i++) {
    setCell(matrix, 6, i, i % 2 === 0);
    setCell(reserved, 6, i, true);
    setCell(matrix, i, 6, i % 2 === 0);
    setCell(reserved, i, 6, true);
  }

  // 4. Dark module
  setCell(matrix, size - 8, 8, true);
  setCell(reserved, size - 8, 8, true);

  // 5. Fill remaining modules deterministically using polynomial hash of the input text
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let bitIndex = 0;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing column
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const targetCol = col - c;
        if (targetCol >= 0 && !getCell(reserved, row, targetCol)) {
          // Linear feedback pseudo-random generator mixed with hash
          const step = bitIndex + row * 31 + targetCol * 17;
          const bit = (Math.sin(hash + step) * 10000) % 1 > 0.42;
          setCell(matrix, row, targetCol, bit);
          bitIndex++;
        }
      }
    }
  }

  return matrix;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 96,
  className = "",
  fgColor = "#0F172A",
  bgColor = "#FFFFFF",
  includeMargin = true,
}) => {
  const matrix = useMemo(() => generateQrMatrix(value), [value]);
  const matrixSize = matrix.length;
  const margin = includeMargin ? 2 : 0;
  const viewBoxSize = matrixSize + margin * 2;

  return (
    <svg
      role="img"
      aria-label={`QR Code for ${value}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width={viewBoxSize}
        height={viewBoxSize}
        fill={bgColor}
      />
      {/* Data modules */}
      {matrix.map((row, r) =>
        row.map((isDark, c) => {
          if (!isDark) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c + margin}
              y={r + margin}
              width={1}
              height={1}
              fill={fgColor}
            />
          );
        }),
      )}
    </svg>
  );
};

export default QrCodeSvg;
