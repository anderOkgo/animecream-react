import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AdminPanel from '../AdminPanel';

// Submitting: every step of an update (series, genres, titles, image) and of a create (series,
// image), each failure, the "moved on to another series meanwhile" checks after every request,
// and the form controls. Requests are answered by the mocks below.
vi.mock('../../../helpers/helpHttp', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() } }));
import helpHttp from '../../../helpers/helpHttp';
vi.mock('../../../services/auth.service', () => ({ default: { getCurrentUser: vi.fn(() => ({ token: 'tok' })) } }));

const GENRES = [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }];
const DEMOS = [{ id: 1, name: 'Shounen' }];
const SERIES = { id: 42, production_name: 'S', production_year: 2020, genres: [{ id: 1 }], titles: [{ id: 5, name: 'Old' }] };
const props = () => ({
  t: (k) => k,
  seriesToEdit: null,
  onEditCancel: vi.fn(),
  onEditComplete: vi.fn(),
  setProc: vi.fn(),
  proc: false,
  init: true,
  setGlobalMessage: vi.fn(),
});
let p;
const file = () => new File(['x'], 'cover.png', { type: 'image/png' });
const submit = () => fireEvent.submit(document.querySelector('form'));
const setJson = (data) => fireEvent.change(document.getElementById('jsonData'), { target: { value: JSON.stringify(data) } });
const setImage = (f = file()) => fireEvent.change(document.getElementById('image'), { target: { files: f ? [f] : [] } });
const lastMessage = () => p.setGlobalMessage.mock.calls.at(-1)?.[0];

/** Renders the edit of SERIES, in JSON mode, once it has loaded. */
const renderEdit = async () => {
  const view = render(<AdminPanel {...p} seriesToEdit={{ id: 42 }} />);
  await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('S'));
  fireEvent.click(screen.getByLabelText('useJSON'));
  return view;
};
const changed = { name: 'S', year: 2020, genres: [2, 1], titles: ['New'] }; // genres and titles changed

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  p = props();
  helpHttp.get.mockImplementation((url) => {
    if (url.endsWith('genres')) return Promise.resolve({ genres: GENRES });
    if (url.endsWith('demographics')) return Promise.resolve({ demographics: DEMOS });
    return Promise.resolve(SERIES);
  });
  helpHttp.put.mockResolvedValue({});
  helpHttp.post.mockResolvedValue({});
  helpHttp.del.mockResolvedValue({});
});

describe('AdminPanel, update', () => {
  it('updates the series, its genres and titles, uploads the image, then completes after 500 ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderEdit();
    setJson(changed);
    setImage();
    expect(screen.getByText(/cover.png/)).toBeInTheDocument();
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success', prefixKey: 'seriesUpdated' }));
    expect(helpHttp.put).toHaveBeenCalledWith(expect.stringMatching(/42$/), { body: changed, token: 'Bearer tok' });
    expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/42\/genres$/), { body: { genreIds: [1, 2] }, token: 'Bearer tok' });
    expect(helpHttp.del).toHaveBeenCalledWith(expect.stringMatching(/42\/titles$/), { body: { titleIds: [5] }, token: 'Bearer tok' });
    expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/42\/titles$/), { body: { titles: ['New'] }, token: 'Bearer tok' });
    expect(helpHttp.put).toHaveBeenCalledWith(expect.stringMatching(/42\/image$/), expect.objectContaining({ timeout: 30000 }));
    act(() => vi.advanceTimersByTime(500));
    expect(p.onEditComplete).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('sends no genres or titles when the series has none and had none, and no image when none is chosen', async () => {
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { genres: GENRES } : url.endsWith('demographics') ? { demographics: DEMOS } : { id: 42, production_name: 'S' })
    );
    await renderEdit();
    setJson({ name: 'S' });
    setImage(null); // the file dialog was cancelled
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success' }));
    expect(helpHttp.post).not.toHaveBeenCalled();
    expect(helpHttp.del).not.toHaveBeenCalled();
    expect(helpHttp.put).toHaveBeenCalledTimes(1);
  });

  it('adds titles without removing any when the series had none, and removes them all when cleared', async () => {
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { genres: GENRES } : url.endsWith('demographics') ? { demographics: DEMOS } : { id: 42, production_name: 'S', titles: ['Old name'] })
    );
    const view = await renderEdit();
    setJson({ name: 'S', titles: ['Brand new'] });
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success' }));
    expect(helpHttp.del).not.toHaveBeenCalled(); // "Old name" had no id to remove
    view.unmount();

    helpHttp.post.mockClear();
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { genres: GENRES } : url.endsWith('demographics') ? { demographics: DEMOS } : SERIES)
    );
    await renderEdit();
    setJson({ name: 'S', genres: [1], titles: [' '] });
    submit();
    await waitFor(() => expect(helpHttp.del).toHaveBeenCalled());
    expect(helpHttp.post).not.toHaveBeenCalledWith(expect.stringMatching(/titles$/), expect.anything());
  });

  const failures = [
    ['the series update', () => helpHttp.put.mockResolvedValueOnce({ err: { message: 'bad' } }), { type: 'error', fallbackKey: 'errorUpdatingSeries' }],
    ['the genres', () => helpHttp.post.mockResolvedValueOnce({ err: { message: 'bad' } }), { prefixKey: 'genresUpdateFailed' }],
    ['removing the titles', () => helpHttp.del.mockResolvedValueOnce({ err: { message: 'bad' } }), { prefixKey: 'titlesRemoveFailed' }],
    ['adding the titles', () => helpHttp.post.mockResolvedValueOnce({}).mockResolvedValueOnce({ err: { message: 'bad' } }), { prefixKey: 'titlesAddFailed' }],
    ['the image', () => helpHttp.put.mockResolvedValueOnce({}).mockResolvedValueOnce({ err: { message: 'bad' } }), { prefixKey: 'imageUploadFailed' }],
  ];
  it.each(failures)('stops and reports a failure of %s', async (_label, fail, expected) => {
    await renderEdit();
    setJson(changed);
    setImage();
    fail();
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject(expected));
    expect(p.onEditComplete).not.toHaveBeenCalled();
    expect(p.setProc).toHaveBeenLastCalledWith(false);
  });

  it('refuses to update a series it could not identify', async () => {
    render(<AdminPanel {...p} seriesToEdit={{ production_name: 'Card without id' }} />);
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Card without id'));
    submit();
    await waitFor(() => expect(lastMessage()).toEqual({ type: 'error', key: 'errorUpdatingSeries' }));
  });

  it('reports invalid JSON', async () => {
    await renderEdit();
    fireEvent.change(document.getElementById('jsonData'), { target: { value: '{nope' } });
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ prefixKey: 'invalidDataFormat' }));
  });

  it('reports an unexpected error during the submit', async () => {
    helpHttp.put.mockRejectedValueOnce(new Error('boom'));
    await renderEdit();
    setJson(changed);
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ prefixKey: 'errorPrefix', error: 'boom' }));
  });

  it('ignores a second submit while the first is running', async () => {
    let finish;
    helpHttp.put.mockReturnValueOnce(new Promise((r) => (finish = r)));
    await renderEdit();
    setJson({ name: 'S', genres: [1], titles: ['Old'] });
    submit();
    submit();
    expect(helpHttp.put).toHaveBeenCalledTimes(1);
    finish({});
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success' }));
  });

  // After each request: if the panel moved on to another series meanwhile, the submit stops quietly
  const steps = [
    ['the series update', 'put', 0],
    ['the genres', 'post', 0],
    ['removing the titles', 'del', 0],
    ['adding the titles', 'post', 1],
    ['the image upload', 'put', 1],
  ];
  it.each(steps)('stops quietly when the edit moved on during %s', async (_label, method, nth) => {
    let release;
    const held = new Promise((r) => (release = r));
    let calls = 0;
    helpHttp[method].mockImplementation(() => (calls++ === nth ? held : Promise.resolve({})));
    const view = await renderEdit();
    setJson(changed);
    setImage();
    submit();
    await waitFor(() => expect(calls).toBeGreaterThan(nth));
    view.rerender(<AdminPanel {...p} seriesToEdit={{ id: 43 }} />);
    release({});
    await waitFor(() => expect(p.setProc).toHaveBeenLastCalledWith(false));
    expect(p.setGlobalMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('does not complete a finished update when the edit moved on before the 500 ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const view = await renderEdit();
    setJson({ name: 'S', genres: [1], titles: ['Old'] });
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success' }));
    view.rerender(<AdminPanel {...p} seriesToEdit={{ id: 43 }} />);
    act(() => vi.advanceTimersByTime(500));
    expect(p.onEditComplete).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('AdminPanel, create', () => {
  const renderCreate = () => render(<AdminPanel {...p} />);

  it('creates the series, uploads its image, clears the form, then completes after 1.5 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    helpHttp.post.mockResolvedValueOnce({ id: 99 });
    renderCreate();
    setJson({ name: 'New' });
    setImage();
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success', prefixKey: 'seriesCreated' }));
    expect(document.getElementById('jsonData')).toHaveValue('');
    act(() => vi.advanceTimersByTime(1500));
    expect(p.onEditComplete).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('reports a create without an id, and a failed image upload', async () => {
    helpHttp.post.mockResolvedValueOnce({});
    renderCreate();
    setJson({ name: 'New' });
    setImage();
    submit();
    await waitFor(() => expect(lastMessage()).toEqual({ type: 'error', key: 'noIdReturned' }));

    helpHttp.post.mockResolvedValueOnce({ id: 99 });
    helpHttp.put.mockResolvedValueOnce({ err: { message: 'too big' } });
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ prefixKey: 'seriesCreated', suffixKey: 'imageUploadFailed' }));
  });

  it.each([
    ['the create', 'post'],
    ['the image upload', 'put'],
  ])('stops quietly when the panel moved on during %s', async (_label, method) => {
    let release;
    const held = new Promise((r) => (release = r));
    helpHttp.post.mockResolvedValue({ id: 99 });
    helpHttp[method].mockReturnValueOnce(held);
    const view = renderCreate();
    setJson({ name: 'New' });
    setImage();
    submit();
    await waitFor(() => expect(helpHttp[method]).toHaveBeenCalled());
    view.rerender(<AdminPanel {...p} seriesToEdit={{ id: 50 }} />);
    release({ id: 99 });
    await waitFor(() => expect(p.setProc).toHaveBeenLastCalledWith(false));
    expect(p.setGlobalMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('does not complete a finished create when the panel moved on before the 1.5 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    helpHttp.post.mockResolvedValueOnce({ id: 99 });
    const view = renderCreate();
    setJson({ name: 'New' });
    setImage();
    submit();
    await waitFor(() => expect(lastMessage()).toMatchObject({ type: 'success' }));
    view.rerender(<AdminPanel {...p} seriesToEdit={{ id: 50 }} />);
    act(() => vi.advanceTimersByTime(1500));
    expect(p.onEditComplete).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('AdminPanel, form controls', () => {
  it('edits the form fields, numbers and the visible checkbox, and submits them typed', async () => {
    helpHttp.post.mockResolvedValueOnce({ id: 99 });
    render(<AdminPanel {...p} />);
    fireEvent.click(screen.getByLabelText('useForm'));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Shounen' })).toBeInTheDocument());
    fireEvent.change(document.getElementById('name'), { target: { name: 'name', value: 'Typed' } });
    fireEvent.change(document.getElementById('year'), { target: { name: 'year', value: '2001' } });
    fireEvent.change(document.getElementById('chapter_number'), { target: { name: 'chapter_number', value: '13', type: 'number' } });
    fireEvent.click(document.querySelector('input[name="visible"]'));
    fireEvent.click(screen.getByTitle('addTitle'));
    fireEvent.change(screen.getByPlaceholderText('alternativeTitle'), { target: { value: 'Alt' } });
    setImage();
    submit();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalled());
    expect(helpHttp.post.mock.calls[0][1].body).toMatchObject({ name: 'Typed', year: 2001, chapter_number: 13, visible: false, titles: ['Alt'] });
  });

  it('shows translated messages on invalid fields and clears them on input', async () => {
    render(<AdminPanel {...p} />);
    const json = document.getElementById('jsonData');
    fireEvent.invalid(json);
    expect(json.validationMessage).toBe('pleaseFillThisField');
    fireEvent.input(json);
    const image = document.getElementById('image');
    fireEvent.invalid(image);
    expect(image.validationMessage).toBe('pleaseFillThisField');
    fireEvent.input(image);
    fireEvent.click(screen.getByLabelText('useForm'));
    // The demographic select is disabled (so not validated) until the options have loaded
    await waitFor(() => expect(document.getElementById('demography_id')).not.toBeDisabled());
    for (const id of ['name', 'year', 'demography_id']) {
      const field = document.getElementById(id);
      fireEvent.invalid(field);
      expect(field.validationMessage).toBe('pleaseFillThisField');
      fireEvent.input(field);
    }
  });

  it('uses built-in labels when the keys are not translated', async () => {
    render(<AdminPanel {...p} t={() => ''} seriesToEdit={{ id: 42 }} />);
    await waitFor(() => expect(screen.getByText('Edit Series')).toBeInTheDocument());
    ['Cancel', 'Update Series', 'Alternative Titles', 'Year', 'Chapters', 'Qualification', 'Description (ES)', 'Description (EN)', 'Demographic', 'Visible', 'Genres', 'Leave empty to keep current image'].forEach(
      (text) => expect(screen.getAllByText(new RegExp(text.replace(/[()]/g, '.'))).length).toBeGreaterThan(0)
    );
    expect(screen.getByPlaceholderText('Alternative title')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Use JSON'));
    expect(screen.getByText(/Series Data/)).toBeInTheDocument();
    setImage();
    expect(screen.getByText(/Selected: cover.png/)).toBeInTheDocument();
  });

  it('shows Creating / Updating on the button while busy', async () => {
    helpHttp.post.mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<AdminPanel {...p} t={() => ''} />);
    expect(screen.getByText('Create Series', { selector: 'h2' })).toBeInTheDocument();
    setJson({ name: 'New' });
    setImage();
    submit();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Creating...' })).toBeInTheDocument());
    unmount();
    helpHttp.put.mockReturnValue(new Promise(() => {}));
    await renderEditBlank();
  });
});

async function renderEditBlank() {
  render(<AdminPanel {...p} t={() => ''} seriesToEdit={{ id: 42 }} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Update Series' })).not.toBeDisabled());
  fireEvent.click(screen.getByLabelText('Use JSON'));
  setJson(changed);
  submit();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Updating...' })).toBeInTheDocument());
}
