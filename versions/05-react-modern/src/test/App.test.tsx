import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '../App';
import { useAlbumStore } from '../store/useAlbumStore';

const img = (text: string) => ({ '#text': text, size: 'x' });

const payload = {
  results: {
    albummatches: {
      album: [
        {
          name: 'Kind of Blue',
          artist: 'Miles Davis',
          mbid: 'm1',
          image: [img('s'), img('m'), img('https://example.test/cover.png')],
        },
      ],
    },
  },
};

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useAlbumStore.setState({ topAlbumList: [] });
  vi.stubEnv('VITE_LASTFM_API_KEY', 'test-key');
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(payload), { status: 200 }),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('searches, renders a result, and adds it to the persisted list', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/search for an album/i), 'blue');
    await user.click(screen.getByRole('button', { name: /go!/i }));

    expect(await screen.findByRole('heading', { name: 'Kind of Blue' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add to list/i }));

    expect(useAlbumStore.getState().topAlbumList).toEqual([
      { id: 'm1', name: 'Kind of Blue', artist: 'Miles Davis', image: 'https://example.test/cover.png' },
    ]);
    expect(localStorage.getItem('albumList')).toContain('m1');
  });
});
