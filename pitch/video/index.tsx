import { Composition, registerRoot } from 'remotion'
import { Pitch, pitchDuration, pitchFps, pitchHeight, pitchId, pitchWidth } from './Pitch'

function Root() {
  return (
    <Composition id={pitchId} component={Pitch} durationInFrames={pitchDuration} fps={pitchFps} width={pitchWidth} height={pitchHeight} />
  )
}

registerRoot(Root)
