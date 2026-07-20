import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement these (only window.scrollTo has a "not
// implemented" stub, not arbitrary elements) -- several components call
// them directly (scroll-to-top on submit, scroll-selected-suggestion-into-
// view), so stub them globally rather than per-test-file.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
