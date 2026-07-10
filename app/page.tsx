"use client";

import { useState } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Work from "@/components/sections/Work";
import Resume from "@/components/sections/Resume";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <SmoothScroll>
      <Cursor />
      <Preloader onDone={() => setReady(true)} />
      <Navbar />
      <main className="grain">
        <Hero start={ready} />
        <About />
        <Experience />
        <Skills />
        <Work />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
