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

interface IntroSceneProps {
  title: string;
  subtitle: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: springs.gentle });
  const titleY = interpolate(titleOpacity, [0, 1], [40, 0]);

  const subtitleOpacity = spring({
    frame: frame - 15,
    fps,
    config: springs.gentle,
  });
  const subtitleY = interpolate(subtitleOpacity, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgLight} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: fontSizes.title,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: colors.text,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: fontSizes.subtitle,
          fontFamily: fonts.body,
          fontWeight: 400,
          color: colors.textMuted,
          textAlign: 'center',
          marginTop: spacing.lg,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
