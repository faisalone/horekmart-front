'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const PromoBanner = () => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set the target time for early access (you can modify this date/time)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2); // Example: 2 days from now
    targetDate.setHours(23, 59, 59, 999); // End of day

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeRemaining({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds)
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second for real-time countdown
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="#flash-deals-title" className="relative overflow-hidden bg-gradient-to-r from-red-500 to-blue-600 py-6 md:py-4 rounded-xl block group cursor-pointer scroll-smooth">
      {/* Full background gradient arrow pattern - Ultra subtle */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="flex items-center space-x-1 md:space-x-3 font-bold text-white select-none transform -translate-y-2">
          <span className="opacity-1 group-hover:opacity-3 transition-opacity duration-500 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-2 group-hover:opacity-4 transition-opacity duration-500 delay-100 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-2 group-hover:opacity-5 transition-opacity duration-500 delay-200 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-3 group-hover:opacity-6 transition-opacity duration-500 delay-300 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-4 group-hover:opacity-8 transition-opacity duration-500 delay-400 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-5 group-hover:opacity-10 transition-opacity duration-500 delay-500 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-6 group-hover:opacity-12 transition-opacity duration-500 delay-600 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-8 group-hover:opacity-15 transition-opacity duration-500 delay-700 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
          <span className="opacity-10 group-hover:opacity-18 transition-opacity duration-500 delay-800 text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none">{'>'}</span>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Mobile: Stacked Layout | Desktop: Side by side with centered countdown */}
        <div className="flex flex-col md:flex-row items-center md:justify-center gap-4 md:gap-8 text-center">
          
          {/* Sale Info - CENTERED on both mobile and desktop */}
		  <div className="w-full flex flex-col items-center justify-center md:absolute md:left-4 md:top-1/2 md:transform md:-translate-y-1/2 md:w-auto z-10 order-1">
			<h1 className="text-white text-xl md:text-2xl font-black drop-shadow-lg text-center">
			  🎉 MEGA SALE
			</h1>
			<p className="text-white text-sm font-semibold drop-shadow-lg text-center">
			  Up to 70% OFF
			</p>
		  </div>

          {/* Countdown - Bottom on mobile, Centered on desktop */}
          <div className="flex items-center gap-2 md:gap-3 relative z-10 order-2">
            <div className="text-white text-sm font-black uppercase tracking-widest mr-3 drop-shadow-lg">
              Ends in:
            </div>
            
            {/* Days */}
            <div className="text-center">
              <div className="text-white text-3xl md:text-4xl font-black tabular-nums leading-none drop-shadow-xl">
                {String(timeRemaining.days).padStart(2, '0')}
              </div>
              <div className="text-white text-xs font-bold uppercase tracking-wider drop-shadow-lg">DAYS</div>
            </div>
            
            <div className="text-white font-black text-3xl md:text-4xl mx-1 drop-shadow-xl">:</div>
            
            {/* Hours */}
            <div className="text-center">
              <div className="text-white text-3xl md:text-4xl font-black tabular-nums leading-none drop-shadow-xl">
                {String(timeRemaining.hours).padStart(2, '0')}
              </div>
              <div className="text-white text-xs font-bold uppercase tracking-wider drop-shadow-lg">HRS</div>
            </div>
            
            <div className="text-white font-black text-3xl md:text-4xl mx-1 drop-shadow-xl">:</div>
            
            {/* Minutes */}
            <div className="text-center">
              <div className="text-white text-3xl md:text-4xl font-black tabular-nums leading-none drop-shadow-xl">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-white text-xs font-bold uppercase tracking-wider drop-shadow-lg">MIN</div>
            </div>
            
            <div className="text-white font-black text-3xl md:text-4xl mx-1 drop-shadow-xl">:</div>
            
            {/* Seconds */}
            <div className="text-center animate-pulse">
              <div className="text-yellow-300 text-3xl md:text-4xl font-black tabular-nums leading-none drop-shadow-xl">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-yellow-300 text-xs font-bold uppercase tracking-wider drop-shadow-lg">SEC</div>
            </div>
          </div>

          {/* Right: Desktop CTA - Animated text and arrow */}
          <div className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span className="text-white font-black text-lg tracking-widest drop-shadow-lg group-hover:tracking-wider transition-all duration-300">JUMP NOW</span>
            <ArrowRight size={24} className="text-white drop-shadow-lg stroke-[1.5] group-hover:translate-x-1 transition-transform duration-300" />
          </div>

          {/* Mobile: Bottom center CTA - below countdown */}
          <div className="md:hidden mt-4 flex justify-center z-10 order-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-wider drop-shadow-lg">JUMP NOW</span>
              <ArrowRight size={20} className="text-white drop-shadow-lg stroke-[1.5]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PromoBanner;
