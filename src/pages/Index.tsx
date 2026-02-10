import { Layout } from '@/components/layout';
import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  WhoItsForSection,
  MobileAppSection,
  CTASection,
} from '@/components/landing';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <MobileAppSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhoItsForSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
