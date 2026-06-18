import type { EraId, SynthParams, TrackName } from './types';

export const TRACKS: TrackName[] = ['bass', 'pad', 'lead', 'fx'];
export const STEPS = 16;
export const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'] as const;

export const DEFAULT_PARAMS: Record<TrackName, SynthParams> = {
  bass: { waveform: 'sawtooth', frequency: 82, cutoff: 800, resonance: 2, stutterRate: 0 },
  pad: { waveform: 'sine', frequency: 220, cutoff: 1200, resonance: 1, stutterRate: 0 },
  lead: { waveform: 'square', frequency: 440, cutoff: 2000, resonance: 3, stutterRate: 0 },
  fx: { waveform: 'triangle', frequency: 120, cutoff: 600, resonance: 2, stutterRate: 0 },
};

export const MUSEUM_COPY: Record<EraId, string> = {
  '1970s-analog': `<strong>1970s — Moog Analog Revolution</strong><br><br>
    Robert Moog's voltage-controlled synthesizers transformed pop production. <strong>Michael Jackson</strong>'s
    "Thriller" (1982) leaned on Minimoog bass lines sculpted by <strong>Quincy Jones</strong>.
    <strong>Kraftwerk</strong>'s "Autobahn" (1974) proved synthesizers could carry entire compositions —
    motorik pads and sequenced leads from Moog modular systems.<br><br>
    <em>Baseline loaded: warm saw bass + evolving pad.</em>`,
  '1980s-roland': `<strong>1980s — Roland TR-808 & TR-909</strong><br><br>
    Roland's drum machines were commercial failures — until hip-hop, house, and R&B producers
    repurposed them. The <strong>808</strong>'s sub-kick became the foundation of electro and trap.
    The <strong>909</strong> powered Chicago house and later <strong>Daft Punk</strong>'s French touch.
    <strong>Prince</strong> blended Oberheim analog with emerging digital FM on "Purple Rain".<br><br>
    <em>Baseline loaded: four-on-the-floor 909 pattern + punchy bass.</em>`,
  '1990s-fm': `<strong>1990s — Digital FM & Bright Pop</strong><br><br>
    The <strong>Yamaha DX7</strong> defined 80s/90s chart sonics with frequency modulation —
    bell-like, glassy timbres impossible on analog gear. Dance-pop producers like
    <strong>C&C Music Factory</strong> stacked FM stabs with gated house rhythms.
    FM's harmonic complexity allowed bright leads to cut through dense mixes without harsh distortion.<br><br>
    <em>Baseline loaded: digital lead register + syncopated FX.</em>`,
};

export const ERA_CARDS: { id: EraId; year: string; title: string; tag: string; artists: string }[] = [
  { id: '1970s-analog', year: '1970s', title: 'Moog Analog', tag: 'Fat Analog Bass & Cosmic Pads', artists: 'Kraftwerk, Quincy Jones' },
  { id: '1980s-roland', year: '1980s', title: 'Roland 808/909', tag: 'Urban & Dance Rhythms', artists: 'Prince, Frankie Knuckles' },
  { id: '1990s-fm', year: '1990s', title: 'Digital FM', tag: 'Bright Pop Leads', artists: 'DX7 era chart production' },
];

/** Relative URLs — Vite dev proxy forwards to Express on :8000 */
export const API_BASE = '';
