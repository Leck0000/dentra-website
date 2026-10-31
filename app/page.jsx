import DeviceExplodedView from '../components/device/DeviceExplodedView';
import Brand from '../components/brand';
import Faq from './faq';
import FindDentist from './find-dentist';
import Hero from './hero';
import HowItWorks from './how-it-works';
import InstallIOS from './install-ios';
import Nav from './nav';
import PrivacyTrust from './privacy-trust';
import TreatmentsAI from './treatments-ai';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <DeviceExplodedView />
        <HowItWorks />
        <FindDentist />
        <TreatmentsAI />
        <PrivacyTrust />
        <InstallIOS />
        <Faq />
      </main>
      <footer className="footer">
        <div className="wrap">
          <Brand />
          <p className="disclaimer">
            DENTRA provides general information and screening guidance. It is not a medical diagnosis. Always consult a licensed dentist.
          </p>
          <p className="disclaimer">
            The DENTRA camera is a capstone prototype. It has only been tested on practice models of teeth, and it does not detect or diagnose anything.
          </p>
          <p className="fine">A capstone project. © {new Date().getFullYear()} DENTRA.</p>
        </div>
      </footer>
    </>
  );
}
