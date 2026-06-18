import presetFile from '../data/presets.json' with { type: 'json' };
import type { PresetsPayload } from '../types.js';

const data = presetFile as unknown as {
  presets: PresetsPayload['presets'];
  museumEras: PresetsPayload['museumEras'];
};

export function getPresetsPayload(): PresetsPayload {
  return {
    presets: data.presets,
    museumEras: data.museumEras,
    meta: {
      count: data.presets.length,
      airGapped: true,
      description: 'Static synthesis history corpus — no external API',
    },
  };
}
