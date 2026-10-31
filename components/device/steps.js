import Battery18650 from './Battery18650';
import CameraModule from './CameraModule';
import DisposableBarrier from './DisposableBarrier';
import EnclosureShell from './EnclosureShell';
import NIRLEDs from './NIRLEDs';
import PowerBoard from './PowerBoard';
import RaspberryPiZero from './RaspberryPiZero';

// One entry per scroll step, in reveal order. The first entry sits on top of
// the assembled stack and lifts off first.
//   anchorX: x (in the part's 360-wide box) where the leader line touches it.
//   z:       stacking order while parts overlap. The barrier is a clear film
//            over the shell's tip, so it stays above everything.
// Copy rules: plain language, "captures / helps guide / designed to", never a
// detection, diagnosis or accuracy claim.
export const STEPS = [
  { id: 'shell', name: 'Enclosure shell', desc: 'A 3D-printed case with a clear window at the tip for the camera. Shown here as a concept render.', Part: EnclosureShell, anchorX: 332, z: 10 },
  { id: 'barrier', name: 'Disposable barrier', desc: 'A single-use cover for the part that goes inside the mouth. A fresh one every time, for hygiene.', Part: DisposableBarrier, anchorX: 138, z: 20 },
  { id: 'camera', name: 'Camera module', desc: 'A tiny camera that can also see near-infrared light, which our eyes can’t. It takes the tooth photos.', Part: CameraModule, anchorX: 184, z: 8 },
  { id: 'leds', name: 'Near-infrared lights', desc: 'Small LEDs that give off light our eyes can’t see but the camera can, to light up the teeth.', Part: NIRLEDs, anchorX: 160, z: 7 },
  { id: 'pi', name: 'Raspberry Pi Zero 2 W', desc: 'The tiny computer that runs the camera.', Part: RaspberryPiZero, anchorX: 304, z: 6 },
  { id: 'power', name: 'Power board', desc: 'Charges the battery and keeps the power steady, with an on/off switch and a fuse for safety.', Part: PowerBoard, anchorX: 312, z: 5 },
  { id: 'battery', name: 'Rechargeable battery', desc: 'A standard lithium-ion battery, so it works without a cable.', Part: Battery18650, anchorX: 304, z: 4 },
];

export const FINAL = {
  name: 'The whole prototype',
  desc: 'A capstone prototype. So far it has only been tested on typodonts (practice models of teeth). It does not detect or diagnose anything.',
};
