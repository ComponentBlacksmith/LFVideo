import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { colors, fontSizes, spacing, springs } from '../theme/tokens';
import { fonts } from '../theme/fonts';

interface TerminalSceneProps {
  title: string;
  code: string;
  language?: string;
}

export const TerminalScene: React.FC<TerminalSceneProps> = ({
  title,
  code,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = spring({ frame, fps, config: springs.gentle });
  const lines = code.split('\n');

  // Typing effect: reveal one line every ~15 frames
  const visibleLines = Math.min(
    lines.length,
    Math.floor(frame / 12) + 1,
  );

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
          opacity: containerOpacity,
          fontSize: fontSizes.label,
          fontFamily: fonts.heading,
          fontWeight: 600,
          color: colors.textMuted,
          marginBottom: spacing.md,
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity: containerOpacity,
          background: '#1a1a2e',
          borderRadius: 12,
          padding: spacing.lg,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Terminal header dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: spacing.md,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
        </div>
        {/* Code content */}
        <pre
          style={{
            margin: 0,
            fontSize: fontSizes.label,
            fontFamily: fonts.mono,
            color: colors.text,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {lines.slice(0, visibleLines).map((line, i) => {
            const lineOpacity = interpolate(
              frame - i * 12,
              [0, 8],
              [0, 1],
              { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' },
            );
            return (
              <div key={i} style={{ opacity: lineOpacity }}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
