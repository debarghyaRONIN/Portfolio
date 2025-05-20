"use client";

import React, { useEffect, useState } from "react";
import ParallaxBackground from "@/components/sub/ParallaxBackground";
import AnimationInitializer from "./AnimationInitializer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {isMounted && (
        <>
          <ParallaxBackground />
          <AnimationInitializer />
        </>
      )}
      {children}
    </>
  );
}