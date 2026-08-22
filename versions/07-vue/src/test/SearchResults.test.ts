import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import SearchResults from '../components/SearchResults.vue';
import { useAlbumStore } from '../store/useAlbumStore';
import type { Album } from '../types';

const mk = (id: string): Album => ({
  id,
  name: `name-${id}`,
  artist: `artist-${id}`,
  image: `img-${id}`,
});

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

const mountWith = (albums: Album[]) =>
  mount(SearchResults, {
    props: { albums, loading: false, error: null, hasSearched: true },
  });

describe('SearchResults', () => {
  it('renders a card per usable result', () => {
    const wrapper = mountWith([mk('1'), mk('2')]);
    expect(wrapper.findAll('.album-slide')).toHaveLength(2);
  });

  it('filters out albums already in the list', () => {
    useAlbumStore().addAlbum(mk('1'));
    const wrapper = mountWith([mk('1'), mk('2')]);
    const cards = wrapper.findAll('.album-slide');
    expect(cards).toHaveLength(1);
    expect(wrapper.text()).toContain('name-2');
    expect(wrapper.text()).not.toContain('name-1');
  });

  it('shows the no-results alert on an empty search', () => {
    const wrapper = mountWith([]);
    expect(wrapper.find('.alert').text()).toBe(
      'No results were found. Please try another search',
    );
  });

  it('shows the loader while loading', () => {
    const wrapper = mount(SearchResults, {
      props: { albums: [], loading: true, error: null, hasSearched: true },
    });
    expect(wrapper.find('.loading .loader').exists()).toBe(true);
    expect(wrapper.find('.alert').exists()).toBe(false);
  });
});
