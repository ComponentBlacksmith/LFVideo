import "./index.css";
import { Composition } from "remotion";
import { Ep02Episode } from "./episodes/ep02-video-render/Episode";
import { ep02Meta, totalDurationSec } from "./episodes/ep02-video-render/data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ep02-video-render"
        component={Ep02Episode}
        durationInFrames={Math.ceil(totalDurationSec * ep02Meta.fps)}
        fps={ep02Meta.fps}
        width={ep02Meta.width}
        height={ep02Meta.height}
      />
    </>
  );
};
