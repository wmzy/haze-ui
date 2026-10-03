/**
 * Adapter registry — resolves calendar identifiers to the shared
 * adapter singletons. Lives in its own module so the adapter modules
 * only depend on the contract (`./adapter`), keeping the module graph
 * acyclic.
 */
import type { HazeCalendarIdentifier, HazeDateAdapter } from './adapter';

import { gregoryAdapter } from './gregory';
import { islamicUmalquraAdapter } from './islamic';
import { persianAdapter } from './persian';
import { hebrewAdapter } from './hebrew';
import { japaneseAdapter } from './japanese';
import { buddhistAdapter } from './buddhist';
import { ethiopicAdapter } from './ethiopic';

/**
 * Adapter lookup by calendar identifier. Returns the shared singleton
 * adapters (`gregoryAdapter`, `islamicUmalquraAdapter`, …); throws
 * `RangeError` for identifiers with no built-in adapter.
 */
export function getAdapter(identifier: HazeCalendarIdentifier): HazeDateAdapter {
  switch (identifier) {
    case 'gregory':
      return gregoryAdapter;
    case 'islamic-umalqura':
      return islamicUmalquraAdapter;
    case 'persian':
      return persianAdapter;
    case 'hebrew':
      return hebrewAdapter;
    case 'japanese':
      return japaneseAdapter;
    case 'buddhist':
      return buddhistAdapter;
    case 'ethiopic':
      return ethiopicAdapter;
    default:
      throw new RangeError(`Unknown calendar identifier: ${String(identifier)}`);
  }
}
