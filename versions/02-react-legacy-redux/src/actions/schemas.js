import { schema } from 'normalizr';

const selectedAlbumsSchema = new schema.Entity('lifestyles', {}, { idAttribute: '***' });
const selectedAlbumsSchemaList = new schema.Array(selectedAlbumsSchema);

// Schemas
const Schemas = {
  SELECTED_ALBUMS: selectedAlbumsSchema,
  SELECTED_ALBUMS_LIST: selectedAlbumsSchemaList,
};

export default Schemas;
