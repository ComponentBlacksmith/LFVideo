import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import {
  IntroScene,
  ConceptScene,
  TableScene,
  TimelineScene,
  TerminalScene,
  OutroScene,
  SplitLayout,
} from '../../template';
import {
  ep02Meta,
  sceneDurations,
  introProps,
  s2aProps,
  s2bProps,
  s2cProps,
  s3aProps,
  s3bProps,
  s3cProps,
  s3dProps,
  s4aProps,
  s4bProps,
  s4cProps,
  s4dProps,
  s5aProps,
  s5bProps,
  s5cProps,
  outroProps,
} from './data';

const FPS = ep02Meta.fps;
const toFrames = (sec: number) => Math.round(sec * FPS);

/**
 * ep02 视频主组件：16 场景顺序编排
 * 音频轨：TTS WAV 文件按时序播放
 * 画面轨：各场景组件按持续时长排列
 */
export const Ep02Episode: React.FC = () => {
  // 音频段落
  const audioSegments = [
    'S1_intro', 'S2a_paradigm', 'S2b_frame_as_state', 'S2c_six_routes',
    'S3a_judgment_matrix', 'S3b_remotion_reasons', 'S3c_comparison', 'S3d_tradeoffs',
    'S4a_pipeline', 'S4b_three_piece', 'S4c_orchestrator', 'S4d_ab_track',
    'S5a_data_driven', 'S5b_ssr_guard', 'S5c_ai_render', 'S6_cta',
  ] as const;

  // 计算每段起始帧
  let audioOffset = 0;
  const audioFrames = audioSegments.map((id) => {
    const from = audioOffset;
    audioOffset += toFrames(sceneDurations[id]);
    return { id, from };
  });

  // 场景序列
  let sceneOffset = 0;

  return (
    <>
      {/* 音频轨 */}
      {audioFrames.map(({ id, from }) => (
        <Sequence key={`audio-${id}`} from={from}>
          <Audio src={staticFile(`ep02/${id}.wav`)} />
        </Sequence>
      ))}

      {/* S1: 开头钩子 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S1_intro)}>
        <IntroScene {...introProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S1_intro), null)}

      {/* S2a: 范式与痛点 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S2a_paradigm)}>
        <ConceptScene {...s2aProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S2a_paradigm), null)}

      {/* S2b: 帧即状态 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S2b_frame_as_state)}>
        <ConceptScene {...s2bProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S2b_frame_as_state), null)}

      {/* S2c: 六条路线 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S2c_six_routes)}>
        <TableScene {...s2cProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S2c_six_routes), null)}

      {/* S3a: 判断层矩阵 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S3a_judgment_matrix)}>
        <TableScene {...s3aProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S3a_judgment_matrix), null)}

      {/* S3b: 选型四理由 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S3b_remotion_reasons)}>
        <ConceptScene {...s3bProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S3b_remotion_reasons), null)}

      {/* S3c: Remotion vs HyperFrames */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S3c_comparison)}>
        <SplitLayout {...s3cProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S3c_comparison), null)}

      {/* S3d: 选型代价 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S3d_tradeoffs)}>
        <ConceptScene {...s3dProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S3d_tradeoffs), null)}

      {/* S4a: 七阶段流水线 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S4a_pipeline)}>
        <TimelineScene {...s4aProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S4a_pipeline), null)}

      {/* S4b: 三件套 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S4b_three_piece)}>
        <ConceptScene {...s4bProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S4b_three_piece), null)}

      {/* S4c: 编排器伪代码 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S4c_orchestrator)}>
        <TerminalScene {...s4cProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S4c_orchestrator), null)}

      {/* S4d: A/B轨机制 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S4d_ab_track)}>
        <SplitLayout {...s4dProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S4d_ab_track), null)}

      {/* S5a: 数据驱动 vs 手写 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S5a_data_driven)}>
        <SplitLayout {...s5aProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S5a_data_driven), null)}

      {/* S5b: SSR守卫 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S5b_ssr_guard)}>
        <SplitLayout {...s5bProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S5b_ssr_guard), null)}

      {/* S5c: AI出片 */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S5c_ai_render)}>
        <ConceptScene {...s5cProps} />
      </Sequence>
      {(sceneOffset += toFrames(sceneDurations.S5c_ai_render), null)}

      {/* S6: 结尾CTA */}
      <Sequence from={sceneOffset} durationInFrames={toFrames(sceneDurations.S6_cta)}>
        <OutroScene {...outroProps} />
      </Sequence>
    </>
  );
};
