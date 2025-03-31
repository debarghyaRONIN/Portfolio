import React from "react";
import HeroContent from "../sub/HeroContent";

const Hero = () => {
  return (
    <div className="relative flex flex-col h-full w-full" id="home">
      <video
        autoPlay
        muted
        loop
        className="absolute [-360px] h-full w-full left-0 z-[1] object-cover"
      >
        <source src="/Dark Souls Pixel.mp4" type="video/mp4" />
      </video>
      <HeroContent />
    </div>
  );
};

export default Hero;