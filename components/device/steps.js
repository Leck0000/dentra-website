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
  { id: 'shell', name: 'Enclosure shell', desc: '3D-printed housing with an optical window.', Part: EnclosureShell, anchorX: 332, z: 10 },
  { id: 'barrier', name: 'Disposable intraoral barrier', desc: 'A fresh cover for every use, for hygiene.', Part: DisposableBarrier, anchorX: 164, z: 20 },
  { id: 'camera', name: 'Camera Module 3 NoIR', desc: 'Captures the tooth images.', Part: CameraModule, anchorX: 184, z: 8 },
  { id: 'leds', name: '850 nm NIR LEDs', desc: 'Near-infrared light, with resistors and MOSFET drivers.', Part: NIRLEDs, anchorX: 160, z: 7 },
  { id: 'pi', name: 'Raspberry Pi Zero 2 W', desc: 'The tiny computer that runs the camera.', Part: RaspberryPiZero, anchorX: 304, z: 6 },
  { id: 'power', name: 'Power board', desc: 'TP4056 charging, 5V boost converter, power switch and fuse.', Part: PowerBoard, anchorX: 312, z: 5 },
  { id: 'battery', name: '18650 battery', desc: 'Rechargeable power for handheld use.', Part: Battery18650, anchorX: 304, z: 4 },
];

export const FINAL = {
  name: 'The whole prototype',
  desc: 'Capstone research prototype. Tested on typodont (artificial teeth) models.',
};
