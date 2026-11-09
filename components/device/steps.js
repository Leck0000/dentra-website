// One entry per scroll step, in the order the camera comes apart. `parts` are
// the 3D parts (components/device/scene/model.js) that come off in that step;
// `anchor` is the one the leader line points at (defaults to the first).
//
// Copy rules: plain language, "captures / helps guide / designed to", never a
// detection, diagnosis, accuracy or hardware performance claim.
// Hardware facts come from the mobile app's device model
// (dentra_mobile/lib/features/scan/rendering/device_model.dart).

export const INTRO = {
  title: 'See what’s inside.',
  desc: 'Scroll to take our prototype camera apart, one part at a time.',
};

export const STEPS = [
  {
    id: 'cap',
    parts: ['cap'],
    name: 'Charging end cap',
    desc: 'The teal cap at the base holds the USB-C port the battery charges through.',
  },
  {
    id: 'shell',
    parts: ['front', 'back'],
    name: 'Two-part shell',
    desc: 'A front and back shell shaped for the hand, with a slim neck that leans forward so the head reaches the teeth.',
  },
  {
    id: 'controls',
    parts: ['capture', 'light', 'thumb'],
    name: 'Capture, Light and Power',
    desc: 'Capture takes the photo and Light turns on the lights round the lens. Power is a small slide switch on the side.',
  },
  {
    id: 'window',
    parts: ['window'],
    name: 'Lens window',
    desc: 'A round clear window covers the lens and its lights at the tip.',
  },
  {
    id: 'leds',
    parts: ['leds'],
    name: 'Ring of ten LEDs',
    desc: 'Six white LEDs light the teeth for a color photo. Four near-infrared LEDs give off light our eyes can’t see, for the NIR frame.',
  },
  {
    id: 'camera',
    parts: ['camera'],
    name: 'OV5640 camera',
    desc: 'A small camera module sits at the tip. Each capture takes a color photo, then a NIR frame.',
  },
  {
    id: 'ribbon',
    parts: ['ribbon'],
    name: 'Camera ribbon',
    desc: 'A thin, flexible cable runs up the neck and links the camera to the main board.',
  },
  {
    id: 'board',
    parts: ['board'],
    name: 'ESP32-S3 main board',
    desc: 'Runs the camera, the lights and the buttons, and links to the app over Wi-Fi.',
  },
  {
    id: 'battery',
    parts: ['battery'],
    name: 'Rechargeable battery',
    desc: 'A 2000 mAh lithium cell fills the handle and charges over USB-C.',
  },
];

export const FINAL = {
  name: 'The whole prototype',
  desc: 'A capstone prototype. So far it has only been tested on typodonts (practice models of teeth). It does not detect or diagnose anything.',
};
