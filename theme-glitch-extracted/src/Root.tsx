import React from 'react';
import {Composition} from 'remotion';
import {ThemeScene} from './textfx/scenes/ThemeScene';
import {themeConfigSchema, themeConfigFrames, THEME_CONFIG_DEFAULT} from './textfx/themes';

const COMMON = {fps: 30, width: 1920, height: 1080} as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SceneTheme"
      component={ThemeScene}
      schema={themeConfigSchema}
      defaultProps={THEME_CONFIG_DEFAULT}
      durationInFrames={themeConfigFrames(THEME_CONFIG_DEFAULT)}
      calculateMetadata={({props}) => ({durationInFrames: themeConfigFrames(props)})}
      {...COMMON}
    />
  </>
);
