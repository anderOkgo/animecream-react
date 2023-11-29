import { useState } from 'react';

const MIN = 1;
const SWIPE_THRESHOLD = 170;
const NUM_OPTIONS = 4;

function useSwipeableTabs(initialOption = MIN, numOptions = NUM_OPTIONS, swipeThreshold = SWIPE_THRESHOLD) {
  const [selectedOption, setSelectedOption] = useState(initialOption);

  let startX;
  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > swipeThreshold) {
      deltaX > 0
        ? setSelectedOption((prevOption) => Math.max(prevOption - 1, 1)) // Swipe to the right, select the previous option
        : setSelectedOption((prevOption) => Math.min(prevOption + 1, numOptions)); // Swipe to the left, select the next option
    }

    startX = null;
  };

  return { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd };
}

export default useSwipeableTabs;
