import { vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Tab from '../Tab';

// The rest of Tab: toolbar toggles, scrolling, the admin edit callbacks, list edge cases and the
// history restore of a Top request. Children are thin stand-ins exposing the callbacks Tab gives them.
const { mockSetOpt } = vi.hoisted(() => ({ mockSetOpt: vi.fn() }));
vi.mock('../../Home/Home', () => ({
  default: (props) => {
    if (props.onSetOptReady) props.onSetOptReady(mockSetOpt);
    return (
      <div data-testid="home-mock" data-sort={String(props.sortOrder)} data-numbers={String(props.showRealNumbers)}>
        <button onClick={() => props.onEditSeries({ id: 1, name: 'X' })}>edit-series</button>
        <button onClick={() => props.onAddToList({ id: 2, name: 'Y' })}>add-to-list</button>
        <button onClick={props.onScrollToggle}>scroll-toggle</button>
        <button onClick={props.onShowListManager}>show-list-manager</button>
      </div>
    );
  },
}));
vi.mock('../../Admin/AdminPanel', () => ({
  default: ({ onEditCancel, onEditComplete }) => (
    <div>
      <button onClick={onEditCancel}>edit-cancel</button>
      <button onClick={onEditComplete}>edit-complete</button>
    </div>
  ),
}));
vi.mock('../../MyLists/ListManager', () => ({
  default: ({ onLoadSeries, onListSelected, onClose }) => (
    <div data-testid="list-manager-mock">
      <button onClick={onClose}>close-lists</button>
      <button onClick={() => onLoadSeries([])}>load-nothing</button>
      <button onClick={() => onListSelected(null)}>select-no-list</button>
    </div>
  ),
}));
vi.mock('../../../helpers/catalogStorage', () => ({ isAppOffline: vi.fn(() => false) }));
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
const home = () => screen.getAllByTestId('home-mock')[0];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  isAppOffline.mockReturnValue(false);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  Element.prototype.scrollTo = vi.fn();
});

describe('Tab, toolbar', () => {
  it('cycles the ranking order none → asc → desc → none, and toggles real numbers', () => {
    const { container } = renderTab();
    const sort = container.querySelector('.lang-sort');
    expect(sort).toHaveTextContent('⇄');
    fireEvent.click(sort);
    expect(home().dataset.sort).toBe('asc');
    expect(sort).toHaveTextContent('▲');
    fireEvent.click(sort);
    expect(home().dataset.sort).toBe('desc');
    expect(sort).toHaveTextContent('▼');
    fireEvent.click(sort);
    expect(home().dataset.sort).toBe('null');
    fireEvent.click(container.querySelector('.lang-numbers'));
    expect(home().dataset.numbers).toBe('true');
  });

  it('opens and closes the advanced search, scrolling to the top', () => {
    const { container } = renderTab();
    const advanced = container.querySelector('.lang-advanced-search');
    fireEvent.click(advanced);
    expect(advanced).toHaveTextContent('✕');
    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    fireEvent.click(advanced);
    expect(advanced).toHaveTextContent('🔍');
  });

  it('scroll toggle goes to the bottom, then back to the top; a double click opens the sidebar', () => {
    const { container } = renderTab();
    const toggle = container.querySelector('.scroll-toggle-tab');
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('↑');
    fireEvent.click(screen.getByText('scroll-toggle')); // Home's own button does the same
    expect(toggle).toHaveTextContent('↓');
    fireEvent.doubleClick(toggle);
    expect(container.querySelector('.lang-container').className).toContain('sidebar-open');
  });

  it('opens My Lists, and shows ES in Spanish', () => {
    const { container } = renderTab({ language: 'es' });
    expect(screen.getByTitle('switchToEnglish')).toHaveTextContent('ES');
    fireEvent.click(container.querySelector('.lang-my-lists'));
    expect(screen.getByTestId('list-manager-mock')).toBeInTheDocument();
  });

  it('uses plain-text labels and alerts when the keys are not translated', () => {
    renderTab({ t: () => '', role: 'admin' });
    expect(screen.getByText('Series & OVAs')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getAllByTitle('My Lists').length).toBeGreaterThan(0); // one toolbar per tab panel
    fireEvent.doubleClick(document.querySelector('.lang:not(.lang-sidebar-close):not(.lang-numbers)'));
    expect(window.alert).toHaveBeenCalledWith('Language: User Default');
    localStorage.setItem('lang', 'en');
    fireEvent.doubleClick(document.querySelector('.lang:not(.lang-sidebar-close):not(.lang-numbers)'));
    expect(window.alert).toHaveBeenCalledWith('Language: System Default');
  });

  it('clicking the selected tab again changes nothing', () => {
    renderTab();
    fireEvent.click(document.getElementById('tab-1'));
    expect(document.getElementById('tab-1')).toBeChecked();
  });
});

describe('Tab, admin and lists', () => {
  it('edit cancel and edit complete come back to the Series tab', () => {
    renderTab({ role: 'admin' });
    fireEvent.click(screen.getAllByText('edit-series')[0]);
    expect(document.getElementById('tab-2')).toBeChecked();
    fireEvent.click(screen.getByText('edit-cancel'));
    fireEvent.click(screen.getByText('edit-complete'));
    expect(document.getElementById('tab-1')).toBeChecked();
  });

  it('starts editing without leaving the tab for a non-admin, and is silent offline without a message handler', () => {
    renderTab({ role: 'user' });
    fireEvent.click(screen.getByText('edit-series'));
    expect(baseProps.setProc).toHaveBeenCalledWith(true);
    isAppOffline.mockReturnValue(true);
    renderTab({ setGlobalMessage: undefined });
    expect(() => fireEvent.click(screen.getAllByText('edit-series')[1])).not.toThrow();
  });

  it('does not add to a selected list that was deleted, nor to one it cannot read', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('selectedListId', 'gone');
    localStorage.setItem('gone', '{"items":[]}');
    const { unmount } = renderTab();
    localStorage.removeItem('gone');
    fireEvent.click(screen.getByText('add-to-list'));
    expect(localStorage.getItem('gone')).toBeNull();
    unmount();

    localStorage.setItem('selectedListId', 'bad');
    localStorage.setItem('bad', '{not json');
    renderTab();
    fireEvent.click(screen.getByText('add-to-list'));
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('adds to a list without items yet', () => {
    localStorage.setItem('selectedListId', 'empty');
    localStorage.setItem('empty', '{"name":"Empty"}');
    renderTab();
    fireEvent.click(screen.getByText('add-to-list'));
    expect(JSON.parse(localStorage.getItem('empty')).items).toEqual([{ id: 2, name: 'Y' }]);
  });

  it('forgets a saved selected list that no longer exists', () => {
    localStorage.setItem('selectedListId', 'missing');
    renderTab();
    expect(localStorage.getItem('selectedListId')).toBeNull();
  });

  it('keeps the modal open when a list has no series, and clears the selection', () => {
    localStorage.setItem('selectedListId', 'x');
    localStorage.setItem('x', '{"items":[]}');
    renderTab();
    fireEvent.click(screen.getAllByTitle('myLists')[0]);
    fireEvent.click(screen.getByText('load-nothing'));
    expect(screen.getByTestId('list-manager-mock')).toBeInTheDocument();
    fireEvent.click(screen.getByText('select-no-list'));
    expect(localStorage.getItem('selectedListId')).toBeNull();
  });
});

describe('Tab, history and Top 250', () => {
  it('scrolls to the top when history restores a Top request, and not for others', () => {
    const navigation = (data) => ({ pushHistory: vi.fn(), currentIndex: 1, currentState: { type: 'request', data } });
    renderTab({ navigation: navigation({ type: 'top250' }) });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(1);
    renderTab({ navigation: navigation({ type: 'top100' }) });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(2);
    renderTab({ navigation: navigation({ type: 'genre' }) });
    renderTab({ navigation: { ...navigation(undefined), currentState: { type: 'request' } } });
    renderTab({ navigation: { pushHistory: vi.fn(), currentIndex: 1, currentState: { type: 'tab' } } });
    renderTab({ navigation: undefined });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('Top 250 without navigation still asks Home and scrolls', () => {
    const { container } = renderTab({ navigation: undefined });
    act(() => fireEvent.click(container.querySelector('.lang-top250')));
    expect(mockSetOpt).toHaveBeenCalledWith(expect.objectContaining({ body: expect.objectContaining({ limit: 250 }) }));
  });

  it('scrolls the first section while no tab matches the selection (admin tab left after a role change)', () => {
    const scrolled = [];
    Element.prototype.scrollTo = function scrollTo() {
      scrolled.push(this);
    };
    const nav = (currentState) => ({ pushHistory: vi.fn(), currentIndex: 0, currentState });
    const { rerender } = render(<Tab {...baseProps} role="admin" navigation={nav(null)} />);
    fireEvent.click(document.getElementById('tab-2'));
    expect(document.getElementById('tab-2')).toBeChecked();
    // In one render: the role is no longer admin (tab 2 is gone) and history restores a Top 250
    rerender(<Tab {...baseProps} role="user" navigation={nav({ type: 'request', data: { type: 'top250' } })} />);
    expect(scrolled[0]).toBe(document.querySelector('.section-tab'));
    expect(document.getElementById('tab-1')).toBeChecked();
  });
});

describe('Tab, remaining callbacks', () => {
  it('opens My Lists from Home and closes it', () => {
    renderTab();
    fireEvent.click(screen.getByText('show-list-manager'));
    fireEvent.click(screen.getByText('close-lists'));
    expect(screen.queryByTestId('list-manager-mock')).not.toBeInTheDocument();
  });

  it('says in plain text that a series is already in the list when the key is not translated', () => {
    localStorage.setItem('selectedListId', 'l');
    localStorage.setItem('l', JSON.stringify({ items: [{ id: 2, name: 'Y' }] }));
    renderTab({ t: () => '' });
    fireEvent.click(screen.getByText('add-to-list'));
    expect(window.alert).toHaveBeenCalledWith('This series is already in the list');
  });
});
