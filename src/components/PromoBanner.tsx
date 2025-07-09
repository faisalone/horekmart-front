'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const PromoBanner = () => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    // Set the target time for early access (you can modify this date/time)
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 2); // Example: 2 hours from now
    targetDate.setMinutes(0);
    targetDate.setSeconds(0);

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining({
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes)
        });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0 });
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden theme-gradient-purple-pink py-4 md:py-6 rounded-2xl shadow-2xl border-2 border-white/20">
      {/* Fire effects using theme colors */}
      <div className="absolute inset-0 theme-gradient-purple-pink opacity-80"></div>
      
      {/* Fire base glow */}
      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-purple-600/40 to-transparent"></div>
      
      {/* Real fire flames - proper proportions with theme colors */}
      <div className="absolute inset-0 opacity-40">
        
        {/* Main fire cluster - realistic sizes with theme colors */}
        <div className="absolute bottom-0 left-8 w-6 h-12 theme-fire-purple rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 4s ease-in-out infinite'}}></div>
             
        <div className="absolute bottom-0 left-12 w-4 h-8 theme-fire-pink rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 3.5s ease-in-out infinite reverse'}}></div>
        
        <div className="absolute bottom-0 left-1/2 w-8 h-14 theme-fire-purple rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 5s ease-in-out infinite'}}></div>
             
        <div className="absolute bottom-0 left-1/2 ml-6 w-5 h-10 theme-fire-pink rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 3.8s ease-in-out infinite reverse'}}></div>
        
        <div className="absolute bottom-0 right-8 w-7 h-13 theme-fire-purple rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 4.5s ease-in-out infinite'}}></div>
             
        <div className="absolute bottom-0 right-14 w-4 h-9 theme-fire-pink rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 4.2s ease-in-out infinite reverse'}}></div>
        
        {/* Small flickering flames */}
        <div className="absolute bottom-0 left-6 w-3 h-6 theme-fire-pink rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 2.8s ease-in-out infinite'}}></div>
             
        <div className="absolute bottom-0 right-6 w-3 h-7 theme-fire-purple rounded-t-full transform origin-bottom" 
             style={{animation: 'realFlame 3.2s ease-in-out infinite reverse'}}></div>
      </div>
      
      {/* Real flame animation - proper fire movement */}
      <style jsx>{`
        @keyframes realFlame {
          0% { 
            transform: rotate(0deg) scaleY(1) scaleX(1);
          }
          20% { 
            transform: rotate(2deg) scaleY(0.85) scaleX(1.1);
          }
          40% { 
            transform: rotate(-1deg) scaleY(1.1) scaleX(0.9);
          }
          60% { 
            transform: rotate(3deg) scaleY(0.9) scaleX(1.05);
          }
          80% { 
            transform: rotate(-2deg) scaleY(1.05) scaleX(0.95);
          }
          100% { 
            transform: rotate(0deg) scaleY(1) scaleX(1);
          }
        }
      `}</style>
      
      <div className="relative px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6">
          
          {/* MEGA SALE moved to logo position */}
          <div className="text-center order-1 md:order-1">
            <div className="text-white">
              <div className="text-xl md:text-3xl font-black tracking-tight animate-bounce">
                🎉 MEGA SALE 🎉
              </div>
            </div>
          </div>

            {/* Main promotional content with theme text gradients */}
          <div className="text-center order-2 md:order-2 px-2 max-w-lg">
            <div className="text-white mb-1">
              <div className="text-base md:text-xl font-bold">
                Upto 50% OFF
              </div>
            </div>
            <div className="text-white/90 text-xs md:text-sm font-semibold">
              ✨ Free Delivery • Priority Access • Exclusive Deals ✨
            </div>
          </div>

          {/* Countdown with neon effect - more compact */}
          <div className="text-center order-3 md:order-3 bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
            <div className="text-yellow-300 text-xs md:text-sm font-bold mb-2 uppercase tracking-widest animate-pulse">
              ⚡ Hurry! Ends In ⚡
            </div>
            <div className="flex items-center space-x-2 justify-center">
              <div className="text-center bg-gradient-to-b from-white to-gray-100 rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-lg border border-gray-200">
                <span className="text-red-600 font-black text-lg md:text-2xl tabular-nums drop-shadow-sm">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <div className="text-gray-600 text-xs font-bold uppercase">HRS</div>
              </div>
              <div className="text-white font-bold text-lg md:text-2xl animate-pulse">:</div>
              <div className="text-center bg-gradient-to-b from-white to-gray-100 rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-lg border border-gray-200">
                <span className="text-red-600 font-black text-lg md:text-2xl tabular-nums drop-shadow-sm">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <div className="text-gray-600 text-xs font-bold uppercase">MIN</div>
              </div>
            </div>
          </div>

          {/* CTA Button with theme gradient */}
          <Link 
            href="/walmart-plus" 
            className="relative group order-4 md:order-4"
          >
            <div className="absolute -inset-1 theme-gradient-orange-red rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <div className="relative theme-button-gradient-blue-purple text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-wider hover:scale-105 transform transition-all duration-300 shadow-xl border-2 border-white/30">
              💥 Join Now 💥
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
