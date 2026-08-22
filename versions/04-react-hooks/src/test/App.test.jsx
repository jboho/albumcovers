import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { AlbumListProvider, STORAGE_KEY } from '../store/AlbumListContext';

const img = (text) => ({ '#text': text, size: 'x' });

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
  return render(
    <AlbumListProvider>
      <App />
    </AlbumListProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
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

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual([
      { id: 'm1', name: 'Kind of Blue', artist: 'Miles Davis', image: 'https://example.test/cover.png' },
    ]);
  });
});
