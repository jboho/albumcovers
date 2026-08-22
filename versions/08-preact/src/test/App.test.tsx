import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { App } from '../App';
import { topAlbumList } from '../store/albumStore';
import type { Album } from '../types';

const mk = (id: string): Album => ({
  id,
  name: `name-${id}`,
  artist: `artist-${id}`,
  image: `img-${id}`,
});

beforeEach(() => {
  localStorage.clear();
  topAlbumList.value = [];
});

describe('App', () => {
  it('renders the heading and hides the counter toggle when the list is empty', () => {
    render(<App />);
    expect(screen.getByText(/Favorite Album List Builder/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go!' })).toBeInTheDocument();
    const container = document.getElementById('mainContainer');
    expect(container).not.toHaveClass('counter-active');
  });

  it('activates the counter bar when the list has albums', () => {
    topAlbumList.value = [mk('1')];
    render(<App />);
    expect(screen.getByRole('button', { name: 'View Your List' })).toBeInTheDocument();
    expect(document.getElementById('mainContainer')).toHaveClass('counter-active');
  });
});
