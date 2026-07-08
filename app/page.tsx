import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/landing/Hero";
import Banners from "@/components/landing/Banners";
import Stats from "@/components/landing/Stats";
import Featured from "@/components/landing/Featured";
import WhyUs from "@/components/landing/WhyUs";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Banners />
      <Stats />
      <Featured />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}