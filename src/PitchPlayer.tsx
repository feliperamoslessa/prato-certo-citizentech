import { Player } from '@remotion/player'
import { Pitch, pitchDuration, pitchFps, pitchHeight, pitchWidth } from '../pitch/video/Pitch'

export default function PitchPlayer() {
  return (
    <Player
      component={Pitch}
      durationInFrames={pitchDuration}
      compositionWidth={pitchWidth}
      compositionHeight={pitchHeight}
      fps={pitchFps}
      controls
      style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden' }}
    />
  )
}
