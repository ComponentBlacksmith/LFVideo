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

interface TimelineSceneProps {
  title: string;
  stages: string[];
  activeStage?: number;
}

export const TimelineScene: React.FC<TimelineSceneProps> = ({
  title,
  stages,
  activeStage = 0,
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
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          fontSize: fontSizes.subtitle,
          fontFamily: fonts.heading,
          fontWeight: 700,
          color: colors.text,
          marginBottom: spacing.xxl,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {stages.map((stage, i) => {
          const stageProgress = spring({
            frame: frame - 10 - i * 6,
            fps,
            config: springs.snappy,
          });
          const isActive = i === activeStage;
          const scale = interpolate(stageProgress, [0, 1], [0.8, 1]);

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  opacity: stageProgress,
                  transform: `scale(${scale})`,
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  borderRadius: 8,
                  background: isActive ? colors.primary : colors.surface,
                  border: `2px solid ${isActive ? colors.primary : colors.border}`,
                  fontSize: fontSizes.label,
                  fontFamily: fonts.body,
                  color: isActive ? colors.text : colors.textMuted,
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {stage}
              </div>
              {i < stages.length - 1 && (
                <div
                  style={{
                    opacity: stageProgress,
                    width: 24,
                    height: 2,
                    background: colors.border,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
