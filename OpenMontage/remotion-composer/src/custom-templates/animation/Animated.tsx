import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, easeOutCubic, easeInCubic, type EaseFn} from './presence';
import {compose, toStyle, TRANSITIONS} from './transitions';
import type {TransitionId, TransitionOpts} from './types';

// 共享包裹件：把可配置的「入场过渡 + 出场过渡 + 错峰延迟」套在任意子块上。
// 对应 RemotionMG 的 TextFx —— 效果只管「怎么进/怎么出」，由场景决定包谁、何时包。
// 全部 frame 驱动，渲染确定性；不传任何属性时退化为纯 fade-in。
export interface AnimatedProps {
	/** 入场过渡，默认 'fade'。 */
	enter?: TransitionId;
	/** 出场过渡，默认 'none'（多数场景在场景级统一淡出）。 */
	exit?: TransitionId;
	/** 入场时长（帧），默认 18。 */
	enterDurationInFrames?: number;
	/** 出场时长（帧），默认 15。 */
	exitDurationInFrames?: number;
	/** 入场延迟（帧）——用于多元素错峰 stagger。 */
	delay?: number;
	/** 位移类过渡的距离覆盖（px）。 */
	distance?: number;
	enterEase?: EaseFn;
	exitEase?: EaseFn;
	style?: React.CSSProperties;
	className?: string;
	children: React.ReactNode;
}

export const Animated: React.FC<AnimatedProps> = ({
	enter = 'fade',
	exit = 'none',
	enterDurationInFrames,
	exitDurationInFrames = 15,
	delay = 0,
	distance,
	enterEase = easeOutCubic,
	exitEase = easeInCubic,
	style,
	className,
	children,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// 入场时长比例化：默认取总时长 12%，钳制在 [30, 90] 帧（1-3s），
	// 让短镜头快进、长镜头从容，而非固定帧数一刀切。
	const enterDur =
		enterDurationInFrames ??
		Math.max(30, Math.min(90, Math.round(durationInFrames * 0.12)));

	const opts: TransitionOpts | undefined =
		distance === undefined ? undefined : {distance};

	const enterT = clamp01((frame - delay) / Math.max(1, enterDur));
	const presenceIn = enterEase(enterT);

	const exitStart = durationInFrames - exitDurationInFrames;
	const exitT = clamp01((frame - exitStart) / Math.max(1, exitDurationInFrames));
	const presenceOut = 1 - exitEase(exitT);

	const merged = compose(
		TRANSITIONS[enter](presenceIn, opts),
		TRANSITIONS[exit](presenceOut, opts)
	);

	return (
		<div className={className} style={{...toStyle(merged), ...style}}>
			{children}
		</div>
	);
};
