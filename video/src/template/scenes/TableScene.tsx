import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { colors, fontSizes, spacing, springs } from '../theme/tokens';
import { fonts } from '../theme/fonts';

interface TableSceneProps {
  title: string;
  columns: string[];
  rows: string[][];
  highlightRow?: number;
}

export const TableScene: React.FC<TableSceneProps> = ({
  title,
  columns,
  rows,
  highlightRow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: springs.gentle });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        padding: spacing.xl,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          fontSize: fontSizes.subtitle,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: colors.text,
          marginBottom: spacing.lg,
        }}
      >
        {title}
      </div>
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            background: colors.surface,
            padding: `${spacing.sm}px ${spacing.md}px`,
          }}
        >
          {columns.map((col, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                fontSize: fontSizes.label,
                fontFamily: fonts.heading,
                fontWeight: 600,
                color: colors.secondary,
              }}
            >
              {col}
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((row, rowIdx) => {
          const rowOpacity = spring({
            frame: frame - 15 - rowIdx * 8,
            fps,
            config: springs.gentle,
          });
          const isHighlighted = highlightRow === rowIdx;
          return (
            <div
              key={rowIdx}
              style={{
                opacity: rowOpacity,
                display: 'flex',
                padding: `${spacing.sm}px ${spacing.md}px`,
                background: isHighlighted
                  ? `${colors.primary}22`
                  : rowIdx % 2 === 0
                    ? colors.bgLight
                    : colors.bg,
                borderLeft: isHighlighted
                  ? `4px solid ${colors.primary}`
                  : '4px solid transparent',
              }}
            >
              {row.map((cell, cellIdx) => (
                <div
                  key={cellIdx}
                  style={{
                    flex: 1,
                    fontSize: fontSizes.label,
                    fontFamily: fonts.body,
                    color: colors.text,
                    lineHeight: 1.5,
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
