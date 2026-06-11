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

interface ConceptSceneProps {
  heading: string;
  bullets: string[];
}

export const ConceptScene: React.FC<ConceptSceneProps> = ({
  heading,
  bullets,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingOpacity = spring({ frame, fps, config: springs.gentle });

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
          opacity: headingOpacity,
          fontSize: fontSizes.subtitle,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: colors.primary,
          marginBottom: spacing.lg,
        }}
      >
        {heading}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {bullets.map((bullet, i) => {
          const bulletOpacity = spring({
            frame: frame - 20 - i * 12,
            fps,
            config: springs.gentle,
          });
          const bulletX = interpolate(bulletOpacity, [0, 1], [30, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: bulletOpacity,
                transform: `translateX(${bulletX}px)`,
                fontSize: fontSizes.body,
                fontFamily: fonts.body,
                color: colors.text,
                lineHeight: 1.6,
                paddingLeft: spacing.md,
                borderLeft: `3px solid ${colors.primary}`,
              }}
            >
              {bullet}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
