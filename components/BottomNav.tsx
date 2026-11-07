import React, { useState, useRef, useCallback } from 'react';

interface BottomNavProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

interface NavItem {
  id: 'home' | 'search' | 'sell' | 'wallet' | 'profile' | 'settings';
  label: string;
  badge?: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
  activeColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Auctions',
    activeColor: 'text-red-600 dark:text-red-400',
    renderIcon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5 pointer-events-none" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    id: 'search',
    label: 'Search',
    activeColor: 'text-red-600 dark:text-red-400',
    renderIcon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5 pointer-events-none" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    id: 'sell',
    label: 'Sell',
    activeColor: 'text-red-600 dark:text-red-400',
    renderIcon: (active) => (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-red-500/25 pointer-events-none transition-all duration-200 ${active ? 'ring-2 ring-red-400 ring-offset-1 scale-105 shadow-red-500/40' : 'group-hover:scale-105'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )
  },
  {
    id: 'wallet',
    label: 'Wallet',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    renderIcon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5 pointer-events-none" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    id: 'profile',
    label: 'Profile',
    activeColor: 'text-red-600 dark:text-red-400',
    renderIcon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5 pointer-events-none" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 'settings',
    label: 'Settings',
    activeColor: 'text-red-600 dark:text-red-400',
    renderIcon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5 pointer-events-none" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

export const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, activePage }) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);

  // Guard against synthetic duplicate clicks after drag/swipe finishes
  const ignoreClicksUntilRef = useRef<number>(0);
  const lastNavigatedTimeRef = useRef<number>(0);

  // Map active page to tab index (0 to 5)
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex(item => item.id === activePage));

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }, []);

  // Safe navigation handler with debouncing
  const navigateTo = useCallback((itemId: string) => {
    const now = Date.now();
    if (now < ignoreClicksUntilRef.current) return;
    if (now - lastNavigatedTimeRef.current < 120) return;
    lastNavigatedTimeRef.current = now;
    triggerHaptic();
    onNavigate(itemId);
  }, [onNavigate, triggerHaptic]);

  // Compute item index directly based on clientX relative to container bounds
  const computeIndexFromClientX = useCallback((clientX: number): number => {
    if (!containerRef.current) return activeIndex;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return activeIndex;
    const relativeX = clientX - rect.left;
    const pct = relativeX / rect.width;
    const rawIndex = Math.floor(pct * NAV_ITEMS.length);
    return Math.max(0, Math.min(NAV_ITEMS.length - 1, rawIndex));
  }, [activeIndex]);

  // Track gesture state
  const gestureRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    hasMoved: boolean;
    startIndex: number;
    captured: boolean;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    hasMoved: false,
    startIndex: 0,
    captured: false
  });

  // Handle pointer down (records start coordinates, but does NOT lock pointer capture unless actual drag occurs)
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Only primary button / single touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startIndex = computeIndexFromClientX(e.clientX);
    gestureRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      lastX: e.clientX,
      hasMoved: false,
      startIndex,
      captured: false
    };

    hoverIndexRef.current = startIndex;
  };

  // Handle pointer move (dragging or wiping across the bottom nav bar)
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g.active || g.pointerId === null || g.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - g.startX;
    const deltaY = e.clientY - g.startY;
    g.lastX = e.clientX;

    // Intentional drag threshold: 10px horizontal movement
    if (!g.hasMoved && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      g.hasMoved = true;
      setIsDragging(true);

      // Now that user is definitely dragging, acquire pointer capture so movement continues tracking
      if (!g.captured && containerRef.current) {
        try {
          containerRef.current.setPointerCapture(e.pointerId);
          g.captured = true;
        } catch {
          // Safe fallback
        }
      }
    }

    if (g.hasMoved) {
      const currentIdx = computeIndexFromClientX(e.clientX);
      if (currentIdx !== hoverIndexRef.current) {
        hoverIndexRef.current = currentIdx;
        setHoverIndex(currentIdx);
        triggerHaptic();
      }
    }
  };

  // Handle pointer up (handles both direct clicks and drag / swipe / flick releases)
  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g.active || g.pointerId === null || g.pointerId !== e.pointerId) return;

    if (g.captured && containerRef.current) {
      try {
        if (containerRef.current.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback
      }
    }

    const deltaX = e.clientX - g.startX;
    const deltaY = e.clientY - g.startY;
    const elapsed = Date.now() - g.startTime;
    const wasDragging = g.hasMoved;
    const startIdx = g.startIndex;

    // Reset gesture tracker
    g.active = false;
    g.pointerId = null;
    g.captured = false;

    if (wasDragging) {
      // Prevent synthetic child button clicks from overriding the drag result
      ignoreClicksUntilRef.current = Date.now() + 350;

      // Check for quick flick / wipe gesture (< 350ms with > 20px horizontal motion)
      const isQuickFlick = elapsed < 350 && Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY) * 0.8;

      if (isQuickFlick) {
        if (deltaX > 20) {
          // Swiped / wiped finger to the right -> step forward to next menu item
          const nextIdx = Math.min(NAV_ITEMS.length - 1, activeIndex + 1);
          navigateTo(NAV_ITEMS[nextIdx].id);
        } else if (deltaX < -20) {
          // Swiped / wiped finger to the left -> step backward to previous menu item
          const prevIdx = Math.max(0, activeIndex - 1);
          navigateTo(NAV_ITEMS[prevIdx].id);
        }
      } else if (hoverIndexRef.current !== null && hoverIndexRef.current >= 0 && hoverIndexRef.current < NAV_ITEMS.length) {
        // Dragged smoothly to a specific target tab
        navigateTo(NAV_ITEMS[hoverIndexRef.current].id);
      }
    } else {
      // User tapped or clicked without dragging
      if (startIdx >= 0 && startIdx < NAV_ITEMS.length) {
        navigateTo(NAV_ITEMS[startIdx].id);
      }
    }

    setIsDragging(false);
    setHoverIndex(null);
    hoverIndexRef.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (g.captured && containerRef.current) {
      try {
        if (containerRef.current.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback
      }
    }
    g.active = false;
    g.pointerId = null;
    g.captured = false;
    setIsDragging(false);
    setHoverIndex(null);
    hoverIndexRef.current = null;
  };

  // Direct Button Click Handler (ensures instant click navigation across all browsers)
  const handleButtonClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo(itemId);
  };

  // Slot currently highlighted (either hovered/dragged or active)
  const currentSlotIndex = isDragging && hoverIndex !== null ? hoverIndex : activeIndex;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none select-none">
      <div className="relative w-full max-w-lg pointer-events-auto">
        {/* Curvy Edge Floating Bottom Nav Bar */}
        <nav 
          ref={containerRef}
          aria-label="Bottom Navigation"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`relative w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/90 dark:border-slate-800/90 rounded-full shadow-2xl shadow-slate-900/20 px-2 py-1.5 flex items-center justify-between touch-none select-none transition-all duration-300 cursor-pointer ${
            isDragging ? 'ring-2 ring-red-500/40 shadow-red-500/15 scale-[1.01] cursor-grabbing' : ''
          }`}
        >
          {/* Smooth Sliding Curvy Edge Background Capsule */}
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-red-500/15 via-red-500/20 to-orange-500/15 dark:from-red-500/30 dark:via-red-500/25 dark:to-orange-500/30 border border-red-500/30 dark:border-red-500/40 shadow-xs pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `calc(${100 / NAV_ITEMS.length}% - 6px)`,
              left: `calc(${(currentSlotIndex * 100) / NAV_ITEMS.length}% + 3px)`,
              transitionDuration: isDragging ? '70ms' : '260ms'
            }}
          />

          {/* Navigation Items (Direct button clicks, taps, and swipe/drag all work simultaneously) */}
          {NAV_ITEMS.map((item, index) => {
            const isActive = activePage === item.id;
            const isHovered = isDragging && hoverIndex === index;
            const isItemHighlighted = isActive || isHovered;

            return (
              <button
                key={item.id}
                type="button"
                style={{ touchAction: 'none' }}
                onClick={(e) => handleButtonClick(item.id, e)}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-200 select-none cursor-pointer focus:outline-hidden ${
                  isItemHighlighted
                    ? `${item.activeColor} font-bold scale-[1.04]`
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium'
                }`}
              >
                {item.renderIcon(isItemHighlighted)}
                
                <span className={`text-[10px] leading-tight transition-colors duration-150 pointer-events-none ${
                  isItemHighlighted ? 'font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>

                {/* Subtle Curvy Micro Indicator Dot */}
                {isActive && (
                  <span className="w-1 h-1 bg-red-600 dark:bg-red-500 rounded-full mt-0.5 pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};