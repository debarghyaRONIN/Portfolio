import Hero from "@/components/main/Hero";
import About from "@/components/main/About";
import Skills from "@/components/main/Skills";
import Projects from "@/components/main/Projects";
import Timeline from "@/components/main/Timeline";
import Footer from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";

export default function Home() {
  return (
    <main className="h-full w-full">
      <Navbar />
      <div className="flex flex-col gap-20">
        <Hero />
        <About />
        <Skills />
        <Timeline />
        <Projects />
        <Footer />
      </div>
    </main>
  );
}
