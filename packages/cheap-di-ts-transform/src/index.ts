import { transformer } from './transformer.js';

export { transformer };

/**
 * ts-jest: Remember to increase the version whenever transformer's content is changed. This is to inform Jest to not reuse
 * the previous cache which contains old transformer's content
 */
export const version = 4;
/** ts-jest: Used for constructing cache key */
export const name = 'cheap-di-ts-transform';

// for ts-jest
export { transformer as factory };

export default transformer;
