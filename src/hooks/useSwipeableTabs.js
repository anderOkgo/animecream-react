import { useState, useRef } from 'react';

const MIN = 1;
const SWIPE_THRESHOLD = 170;
const NUM_OPTIONS = 4;

function useSwipeableTabs(initialOption = MIN, numOptions = NUM_OPTIONS, swipeThreshold = SWIPE_THRESHOLD) {
  const [selectedOption, setSelectedOption] = useState(initialOption);

  // The swipe start survives re-renders between touch start and touch end (G14, as in Finanz).
  // `null` means no touch start recorded: a touch end then does nothing.
  const startXRef = useRef(null);
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;

    // Verificar si el swipe viene de un input range
    const target = e.target;
    if (target.type === 'range' || target.closest('input[type="range"]')) {
      startXRef.current = null;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startXRef.current;

    if (Math.abs(deltaX) > swipeThreshold) {
      deltaX > 0
        ? setSelectedOption((prevOption) => Math.max(prevOption - 1, 1)) // Swipe to the right, select the previous option
        : setSelectedOption((prevOption) => Math.min(prevOption + 1, numOptions)); // Swipe to the left, select the next option
    }

    startXRef.current = null;
  };

  return { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd };
}

export default useSwipeableTabs;
