import { vi } from 'vitest';

vi.mock('../../helpers/helpHttp', () => ({
  default: { get: vi.fn() },
}));
import helpHttp from '../../helpers/helpHttp';
import { API_BASE_URL } from '../../helpers/apiConfig';
import set from '../../helpers/set.json';
import DataService from '../data.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DataService.boot', () => {
  it('pings the API base URL with the configured boot timeout', async () => {
    helpHttp.get.mockResolvedValue({ status: 'UP' });

    const result = await DataService.boot();

    expect(helpHttp.get).toHaveBeenCalledWith(API_BASE_URL, { timeout: set.boot_timeout });
    expect(result).toEqual({ status: 'UP' });
  });

  it('propagates the offline/error shape returned by helpHttp', async () => {
    helpHttp.get.mockResolvedValue({ err: { message: 'Offline' } });

    const result = await DataService.boot();

    expect(result).toEqual({ err: { message: 'Offline' } });
  });
});
