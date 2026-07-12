import './AppCrashFallback.css';

/** Last-resort screen shown when a render error escapes the whole app tree. */
const AppCrashFallback = () => (
  <div className="app-crash-fallback">
    <p>Something went wrong and the app couldn&apos;t load.</p>
    <button type="button" onClick={() => window.location.reload()}>
      Reload
    </button>
  </div>
);

export default AppCrashFallback;
