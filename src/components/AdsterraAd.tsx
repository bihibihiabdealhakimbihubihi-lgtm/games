import { useEffect, useRef } from 'react';

export default function AdsterraAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Create script element matching exactly the user-provided code
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl30211530.effectivecpmnetwork.com/6ddf26692331f28623b514bd9d7ce4d5/invoke.js';

    // Append script tag
    const targetElement = containerRef.current;
    if (targetElement) {
      targetElement.appendChild(script);
    }

    return () => {
      // Clean up the script tag upon unmount
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full my-4 flex flex-col items-center justify-center min-h-[100px] bg-black/10 rounded-xl p-2 border border-white/5">
      {/* Container with the exact ID provided by Adsterra */}
      <div id="container-6ddf26692331f28623b514bd9d7ce4d5" className="w-full"></div>
    </div>
  );
}
