import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { colors, fontSizes, spacing, springs } from '../theme/tokens';
import { fonts } from '../theme/fonts';

interface OutroSceneProps {
  summary: string;
  cta: string;
  nextEpisode?: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  summary,
  cta,
  nextEpisode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const summaryOpacity = spring({ frame, fps, config: springs.gentle });
  const ctaOpacity = spring({ frame: frame - 20, fps, config: springs.snappy });
  const nextOpacity = spring({ frame: frame - 40, fps, config: springs.gentle });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.bgLight} 0%, ${colors.bg} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.lg,
      }}
    >
      <div
        style={{
          opacity: summaryOpacity,
          fontSize: fontSizes.subtitle,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: colors.text,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {summary}
      </div>
      <div
        style={{
          opacity: ctaOpacity,
          fontSize: fontSizes.body,
          fontFamily: fonts.body,
          color: colors.accent,
          textAlign: 'center',
          padding: `${spacing.sm}px ${spacing.lg}px`,
          border: `2px solid ${colors.accent}`,
          borderRadius: 8,
        }}
      >
        {cta}
      </div>
      {nextEpisode && (
        <div
          style={{
            opacity: nextOpacity,
            fontSize: fontSizes.body,
            fontFamily: fonts.body,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          下期预告：{nextEpisode}
        </div>
      )}
    </AbsoluteFill>
  );
};
