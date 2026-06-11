import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { colors, fontSizes, spacing, springs } from '../theme/tokens';
import { fonts } from '../theme/fonts';

interface SplitSide {
  title: string;
  points?: string[];
  description?: string;
  code?: string;
}

interface SplitLayoutProps {
  left: SplitSide;
  right: SplitSide;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ left, right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftOpacity = spring({ frame, fps, config: springs.gentle });
  const rightOpacity = spring({ frame: frame - 15, fps, config: springs.gentle });

  const renderSide = (side: SplitSide, opacity: number, isLeft: boolean) => (
    <div
      style={{
        flex: 1,
        opacity,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        borderLeft: isLeft ? 'none' : `2px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          fontSize: fontSizes.body,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: side.title.includes('✅') || side.title.includes('✓')
            ? colors.success
            : side.title.includes('❌') || side.title.includes('✗')
              ? colors.error
              : colors.text,
        }}
      >
        {side.title}
      </div>
      {side.description && (
        <div
          style={{
            fontSize: fontSizes.label,
            fontFamily: fonts.body,
            color: colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          {side.description}
        </div>
      )}
      {side.points && side.points.map((point, i) => (
        <div
          key={i}
          style={{
            fontSize: fontSizes.label,
            fontFamily: fonts.body,
            color: colors.text,
            lineHeight: 1.5,
            paddingLeft: spacing.sm,
          }}
        >
          • {point}
        </div>
      ))}
      {side.code && (
        <pre
          style={{
            fontSize: fontSizes.label,
            fontFamily: fonts.mono,
            color: colors.secondary,
            background: colors.surface,
            padding: spacing.md,
            borderRadius: 8,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {side.code}
        </pre>
      )}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
      }}
    >
      {renderSide(left, leftOpacity, true)}
      {renderSide(right, rightOpacity, false)}
    </AbsoluteFill>
  );
};
