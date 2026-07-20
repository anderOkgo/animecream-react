import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../AdminPanel';

vi.mock('../../../helpers/helpHttp', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));
import helpHttp from '../../../helpers/helpHttp';

vi.mock('../../../services/auth.service', () => ({
  default: { getCurrentUser: vi.fn(() => null) },
}));

const t = (key) => key;

const GENRES = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Comedy' },
];
const DEMOGRAPHICS = [{ id: 1, name: 'Shounen' }];

const baseProps = {
  t,
  seriesToEdit: null,
  onEditCancel: vi.fn(),
  onEditComplete: vi.fn(),
  setProc: vi.fn(),
  proc: false,
  init: true,
  setGlobalMessage: vi.fn(),
};

const renderAdmin = (props = {}) => render(<AdminPanel {...baseProps} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  helpHttp.get.mockImplementation((url) => {
    if (url.includes('genres')) return Promise.resolve({ genres: GENRES });
    if (url.includes('demographics')) return Promise.resolve({ demographics: DEMOGRAPHICS });
    return Promise.resolve({});
  });
});

const switchToFormMode = async (user) => {
  await user.click(screen.getByLabelText('useForm'));
};

// jsdom doesn't correctly reflect a FileList set via user-event's `upload()`
// in its native HTML5 `required`-field validity check for <input
// type="file">, so a real click on the submit button gets silently blocked
// before handleSubmit ever runs (a jsdom limitation, not a real bug --
// confirmed via form.checkValidity() reporting the image field invalid
// despite `files.length === 1`). Submitting via fireEvent.submit(form)
// dispatches the submit event directly, bypassing that native-validation
// step entirely, so these tests exercise handleSubmit's own JS logic
// instead of jsdom's imperfect constraint-validation implementation.
const submitForm = () => fireEvent.submit(document.querySelector('form'));

const fillMinimalFormAndImage = async (user) => {
  await switchToFormMode(user);
  await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole('option', { name: 'Shounen' })).toBeInTheDocument());
  await user.type(screen.getByLabelText(/seriesName/), 'New Series');
  await user.type(screen.getByLabelText(/^year/), '2024');
  const file = new File(['(binary)'], 'cover.png', { type: 'image/png' });
  await user.upload(document.getElementById('image'), file);
};

describe('AdminPanel', () => {
  it('starts in JSON mode for a new series, with the Create Series heading', () => {
    renderAdmin();
    expect(screen.getByRole('heading', { name: 'createSeries' })).toBeInTheDocument();
    expect(screen.getByLabelText('useJSON')).toBeChecked();
    expect(screen.queryByLabelText(/seriesName/)).not.toBeInTheDocument();
  });

  it('starts in Form mode with the Edit Series heading + Cancel button when editing', async () => {
    renderAdmin({ seriesToEdit: { id: 42, production_name: 'Existing' } });
    expect(screen.getByText('editSeries')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('useForm')).toBeChecked());
  });

  it('toggles between JSON and Form modes', async () => {
    const user = userEvent.setup();
    renderAdmin();
    expect(screen.queryByLabelText(/seriesName/)).not.toBeInTheDocument();

    await switchToFormMode(user);
    expect(screen.getByLabelText(/seriesName/)).toBeInTheDocument();

    await user.click(screen.getByLabelText('useJSON'));
    expect(screen.queryByLabelText(/seriesName/)).not.toBeInTheDocument();
  });

  it('adds and removes alternative title inputs', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await switchToFormMode(user);

    expect(screen.queryAllByPlaceholderText('alternativeTitle')).toHaveLength(0);
    await user.click(screen.getByText('+ addTitle'));
    expect(screen.getAllByPlaceholderText('alternativeTitle')).toHaveLength(1);

    await user.click(screen.getByText('+ addTitle'));
    expect(screen.getAllByPlaceholderText('alternativeTitle')).toHaveLength(2);

    await user.click(screen.getAllByTitle('remove')[0]);
    expect(screen.getAllByPlaceholderText('alternativeTitle')).toHaveLength(1);
  });

  it('toggles a genre checkbox on and off', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await switchToFormMode(user);
    await waitFor(() => expect(screen.getByTitle('Action')).toBeInTheDocument());

    const actionCheckbox = screen.getByTitle('Action').previousSibling;
    expect(actionCheckbox).not.toBeChecked();
    await user.click(actionCheckbox);
    expect(actionCheckbox).toBeChecked();
    await user.click(actionCheckbox);
    expect(actionCheckbox).not.toBeChecked();
  });

  it('blocks create submission without an image (JS-level guard)', async () => {
    const user = userEvent.setup();
    const setGlobalMessage = vi.fn();
    renderAdmin({ setGlobalMessage });
    await switchToFormMode(user);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Shounen' })).toBeInTheDocument());
    await user.type(screen.getByLabelText(/seriesName/), 'No Image Series');
    await user.type(screen.getByLabelText(/^year/), '2024');

    submitForm();

    expect(setGlobalMessage).toHaveBeenCalledWith({ type: 'error', key: 'imageRequiredToCreate' });
    expect(helpHttp.post).not.toHaveBeenCalled();
  });

  it('shows transactionWaiting instead of submitting when init/proc guard is not satisfied', async () => {
    const user = userEvent.setup();
    const setGlobalMessage = vi.fn();
    renderAdmin({ init: false, setGlobalMessage });
    await fillMinimalFormAndImage(user);

    submitForm();

    expect(setGlobalMessage).toHaveBeenCalledWith({ type: 'warning', key: 'transactionWaiting' });
    expect(helpHttp.post).not.toHaveBeenCalled();
  });

  it('creates a new series: posts create-complete, uploads the image, then calls onEditComplete', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const onEditComplete = vi.fn();
    const setGlobalMessage = vi.fn();
    helpHttp.post.mockResolvedValue({ id: 99 });
    helpHttp.put.mockResolvedValue({});

    renderAdmin({ onEditComplete, setGlobalMessage });
    await fillMinimalFormAndImage(user);

    submitForm();

    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    const [createUrl, createOptions] = helpHttp.post.mock.calls[0];
    expect(createUrl).toContain('create-complete');
    expect(createOptions.body).toMatchObject({ name: 'New Series', year: 2024 });

    await waitFor(() => expect(helpHttp.put).toHaveBeenCalledTimes(1));
    expect(helpHttp.put.mock.calls[0][0]).toContain('99/image');

    await waitFor(() =>
      expect(setGlobalMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', prefixKey: 'seriesCreated' })
      )
    );

    await vi.advanceTimersByTimeAsync(1500);
    expect(onEditComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('surfaces a create error and never attempts the image upload', async () => {
    const user = userEvent.setup();
    const setGlobalMessage = vi.fn();
    helpHttp.post.mockResolvedValue({ err: { message: 'name taken' } });

    renderAdmin({ setGlobalMessage });
    await fillMinimalFormAndImage(user);
    submitForm();

    await waitFor(() =>
      expect(setGlobalMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', fallbackKey: 'errorCreatingSeries' })
      )
    );
    expect(helpHttp.put).not.toHaveBeenCalled();
  });

  it('loads the existing series into the form when editing by id', async () => {
    helpHttp.get.mockImplementation((url) => {
      if (url.includes('genres')) return Promise.resolve({ genres: GENRES });
      if (url.includes('demographics')) return Promise.resolve({ demographics: DEMOGRAPHICS });
      // The series-by-id fetch.
      return Promise.resolve({
        production_name: 'Loaded Series',
        production_year: 2020,
        genres: [{ id: 1, name: 'Action' }],
        titles: [{ id: 7, name: 'Alt Name' }],
      });
    });

    renderAdmin({ seriesToEdit: { id: 42 } });

    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Loaded Series'));
    expect(screen.getByLabelText(/^year/)).toHaveValue(2020);
    expect(screen.getByDisplayValue('Alt Name')).toBeInTheDocument();
  });

  it('updates an existing series without touching genres/titles endpoints when nothing changed', async () => {
    const user = userEvent.setup();
    helpHttp.get.mockImplementation((url) => {
      if (url.includes('genres')) return Promise.resolve({ genres: GENRES });
      if (url.includes('demographics')) return Promise.resolve({ demographics: DEMOGRAPHICS });
      return Promise.resolve({ production_name: 'Existing', production_year: 2019, genres: [], titles: [] });
    });
    helpHttp.put.mockResolvedValue({});

    renderAdmin({ seriesToEdit: { id: 42 } });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Existing'));

    await user.click(screen.getByText('updateSeries'));

    await waitFor(() => expect(helpHttp.put).toHaveBeenCalledTimes(1));
    expect(helpHttp.put.mock.calls[0][0]).toContain('42');
    expect(helpHttp.post).not.toHaveBeenCalled();
    expect(helpHttp.del).not.toHaveBeenCalled();
  });

  it('pushes a genres diff to the genres endpoint when the selection changed', async () => {
    const user = userEvent.setup();
    helpHttp.get.mockImplementation((url) => {
      if (url.includes('genres')) return Promise.resolve({ genres: GENRES });
      if (url.includes('demographics')) return Promise.resolve({ demographics: DEMOGRAPHICS });
      return Promise.resolve({ production_name: 'Existing', production_year: 2019, genres: [], titles: [] });
    });
    helpHttp.put.mockResolvedValue({});
    helpHttp.post.mockResolvedValue({});

    renderAdmin({ seriesToEdit: { id: 42 } });
    await waitFor(() => expect(screen.getByTitle('Action')).toBeInTheDocument());
    await user.click(screen.getByTitle('Action').previousSibling);

    await user.click(screen.getByText('updateSeries'));

    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    const [genresUrl, genresOptions] = helpHttp.post.mock.calls[0];
    expect(genresUrl).toContain('42/genres');
    expect(genresOptions.body).toEqual({ genreIds: [1] });
  });
});
