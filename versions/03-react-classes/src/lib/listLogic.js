export const MAX_LIST_SIZE = 10;

/**
 * Return a new list with `album` appended, unless the list is already full or
 * the album is already present (deduped by id). Pure — never mutates `list`.
 */
export function addAlbum(list, album, max = MAX_LIST_SIZE) {
  if (list.length >= max) return list;
  if (list.some((a) => a.id === album.id)) return list;
  return [...list, album];
}

/** Return a new list with the album matching `id` removed. Pure. */
export function removeAlbum(list, id) {
  return list.filter((a) => a.id !== id);
}
