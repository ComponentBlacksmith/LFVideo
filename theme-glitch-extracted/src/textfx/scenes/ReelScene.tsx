import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {HeroScene} from './HeroScene';
import {ListScene} from './ListScene';
import {LowerThirdScene} from './LowerThirdScene';
import {CaptionScene} from './CaptionScene';
import {EmphasisScene} from './EmphasisScene';
import {ReelSegment, segmentFrames} from '../schemas';

const renderSegment = (s: ReelSegment): React.ReactNode => {
  switch (s.type) {
    case 'hero': return <HeroScene {...s.props} />;
    case 'list': return <ListScene {...s.props} />;
    case 'lowerThird': return <LowerThirdScene {...s.props} />;
    case 'caption': return <CaptionScene {...s.props} />;
    case 'emphasis': return <EmphasisScene {...s.props} />;
    default: return null;
  }
};

export const ReelScene: React.FC<{segments: ReelSegment[]}> = ({segments}) => (
  <AbsoluteFill style={{background: '#05060d'}}>
    <Series>
      {segments.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={segmentFrames(s)}>
          {renderSegment(s)}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
