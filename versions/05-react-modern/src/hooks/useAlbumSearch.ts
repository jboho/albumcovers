import { useQuery } from '@tanstack/react-query';
import { searchAlbums } from '../lib/lastfm';
import type { Album } from '../types';

/**
 * Server state for album search. TanStack Query caches by search term, so
 * re-running a previous search is instant — the pre-hooks version refetched
 * every time. `enabled` keeps the query idle until there's a term to look up.
 */
export function useAlbumSearch(term: string) {
  return useQuery<Album[]>({
    queryKey: ['albums', term],
    queryFn: ({ signal }) => searchAlbums(term, signal),
    enabled: term.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
