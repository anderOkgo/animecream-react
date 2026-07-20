import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tab from '../Tab';

// Tab's own job is tab-switching state, the offline-gated edit-series
// handoff, the add-to-list direct-vs-modal branching (localStorage-backed),
// the top250 request dispatch, and sidebar/language toggles -- not
// re-testing Home/AdminPanel/ListManager, each of which has its own suite.
// Mocked here as thin stand-ins exposing the callback props Tab passes them.
const { mockSetOpt } = vi.hoisted(() => ({ mockSetOpt: vi.fn() }));

vi.mock('../../Home/Home', () => ({
  default: ({ onEditSeries, onAddToList, onSetOptReady, onShowListManager }) => {
    if (onSetOptReady) onSetOptReady(mockSetOpt);
    return (
      <div data-testid="home-mock">
        <button onClick={() => onEditSeries({ id: 1, name: 'X' })}>edit-series</button>
        <button onClick={() => onAddToList({ id: 2, name: 'Y' })}>add-to-list</button>
        <button onClick={onShowListManager}>show-list-manager</button>
      </div>
    );
  },
}));

vi.mock('../../Admin/AdminPanel', () => ({
  default: () => <div data-testid="admin-panel-mock" />,
}));

vi.mock('../../MyLists/ListManager', () => ({
  default: ({ onClose, onLoadSeries, onListSelected }) => (
    <div data-testid="list-manager-mock">
      <button onClick={onClose}>close-list-manager</button>
      <button onClick={() => onLoadSeries([5, 6])}>load-series-5-6</button>
      <button onClick={() => onListSelected('list-abc')}>select-list-abc</button>
    </div>
  ),
}));

vi.mock('../../../helpers/catalogStorage', () => ({
  isAppOffline: vi.fn(() => false),
}));
import { isAppOffline } from '../../../helpers/catalogStorage';

const t = (key) => key;

const baseProps = {
  t,
  toggleLanguage: vi.fn(),
  saveLanguageAsDefault: vi.fn(),
  restoreLanguageDefault: vi.fn(),
  language: 'en',
  setProc: vi.fn(),
  proc: false,
  init: false,
  role: null,
  navigation: { pushHistory: vi.fn(), currentState: null, currentIndex: 0 },
  setGlobalMessage: vi.fn(),
};

const renderTab = (props = {}) => render(<Tab {...baseProps} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  isAppOffline.mockReturnValue(false);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('Tab', () => {
  it('renders only the Series tab when role is not admin', () => {
    renderTab({ role: null });
    expect(document.getElementById('tab-1')).toBeInTheDocument();
    expect(document.getElementById('tab-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-panel-mock')).not.toBeInTheDocument();
  });

  it('renders both tabs, including the mounted (CSS-hidden) AdminPanel, when role is admin', () => {
    renderTab({ role: 'admin' });
    expect(document.getElementById('tab-1')).toBeInTheDocument();
    expect(document.getElementById('tab-2')).toBeInTheDocument();
    expect(screen.getByTestId('admin-panel-mock')).toBeInTheDocument();
  });

  it('blocks edit-series while offline and notifies via setGlobalMessage instead', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    isAppOffline.mockReturnValue(true);
    const setProc = vi.fn();
    const setGlobalMessage = vi.fn();
    renderTab({ role: 'admin', setProc, setGlobalMessage });

    await user.click(screen.getByText('edit-series'));

    expect(setGlobalMessage).toHaveBeenCalledWith({ type: 'warning', key: 'Offline' });
    expect(setProc).not.toHaveBeenCalled();
  });

  it('starts editing and switches to the Admin tab when online and role is admin', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const setProc = vi.fn();
    renderTab({ role: 'admin', setProc });

    await user.click(screen.getByText('edit-series'));

    expect(setProc).toHaveBeenCalledWith(true);
    expect(document.getElementById('tab-2').checked).toBe(true);
  });

  it('resets back to the Series tab if role stops being admin while Admin tab is selected', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const { rerender } = renderTab({ role: 'admin' });

    await user.click(screen.getByText('edit-series'));
    expect(document.getElementById('tab-2').checked).toBe(true);

    rerender(<Tab {...baseProps} role={null} />);
    expect(document.getElementById('tab-1').checked).toBe(true);
  });

  it('opens the ListManager modal when adding to a list with none selected yet', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    renderTab();

    expect(screen.queryByTestId('list-manager-mock')).not.toBeInTheDocument();
    await user.click(screen.getByText('add-to-list'));
    expect(screen.getByTestId('list-manager-mock')).toBeInTheDocument();
  });

  it('adds directly to the already-selected list without opening the modal', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    localStorage.setItem('my-list', JSON.stringify({ items: [] }));
    localStorage.setItem('selectedListId', 'my-list');

    renderTab();
    await user.click(screen.getByText('add-to-list'));

    expect(screen.queryByTestId('list-manager-mock')).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('my-list'));
    expect(stored.items).toEqual([{ id: 2, name: 'Y' }]);
  });

  it('alerts instead of duplicating when the series is already in the selected list', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    localStorage.setItem('my-list', JSON.stringify({ items: [{ id: 2, name: 'Y' }] }));
    localStorage.setItem('selectedListId', 'my-list');

    renderTab();
    await user.click(screen.getByText('add-to-list'));

    expect(window.alert).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem('my-list'));
    expect(stored.items).toHaveLength(1);
  });

  it('persists list selection to localStorage via the ListManager callback', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    renderTab();

    await user.click(screen.getByText('add-to-list'));
    await user.click(screen.getByText('select-list-abc'));

    expect(localStorage.getItem('selectedListId')).toBe('list-abc');
  });

  it('loads series by id and closes the ListManager modal', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    renderTab();

    await user.click(screen.getByText('add-to-list'));
    expect(screen.getByTestId('list-manager-mock')).toBeInTheDocument();

    await user.click(screen.getByText('load-series-5-6'));
    expect(screen.queryByTestId('list-manager-mock')).not.toBeInTheDocument();
  });

  it('dispatches the top-250 request through navigation and the Home-provided setOpt', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const navigation = { pushHistory: vi.fn(), currentState: null, currentIndex: 0 };
    renderTab({ navigation });

    await user.click(screen.getByTitle('Top 250'));

    const expectedRequest = {
      method: 'POST',
      body: { limit: 250, production_ranking_number: 'ASC', _reverse: true },
    };
    expect(navigation.pushHistory).toHaveBeenCalledWith('request', { type: 'top250', data: expectedRequest });
    expect(mockSetOpt).toHaveBeenCalledWith(expectedRequest);
  });

  it('toggles the sidebar open/closed and its title on click', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    renderTab();

    const toggle = screen.getByTitle('open');
    await user.click(toggle);
    expect(screen.getByTitle('close')).toBeInTheDocument();
  });

  it('saves the current language as default on first double-click (no stored preference)', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const saveLanguageAsDefault = vi.fn();
    renderTab({ saveLanguageAsDefault });

    await user.dblClick(screen.getByTitle('switchToSpanish'));
    expect(saveLanguageAsDefault).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalled();
  });

  it('restores the system default language on double-click when a preference is already stored', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    localStorage.setItem('lang', 'es');
    const restoreLanguageDefault = vi.fn();
    renderTab({ restoreLanguageDefault });

    await user.dblClick(screen.getByTitle('switchToSpanish'));
    expect(restoreLanguageDefault).toHaveBeenCalledTimes(1);
  });
});
