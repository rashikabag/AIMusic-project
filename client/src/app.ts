import { fetchPresets, generateLoop } from './api';
import {
  createAudioRuntime,
  ensureAudio,
  playNote,
  startScope,
  updateFilters,
  type AudioRuntime,
} from './audioEngine';
import {
  DEFAULT_PARAMS,
  ERA_CARDS,
  MUSEUM_COPY,
  STEPS,
  TRACKS,
  WAVEFORMS,
} from './constants';
import type {
  AppState,
  EraId,
  HistoricalPreset,
  PatternPayload,
  SynthParams,
  TabId,
  TrackName,
} from './types';

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!;
const $$ = <T extends Element>(sel: string) => document.querySelectorAll<T>(sel);

function emptyTracks(): AppState['tracks'] {
  return Object.fromEntries(TRACKS.map((t) => [t, Array(STEPS).fill(0)])) as AppState['tracks'];
}

function cloneParams(): Record<TrackName, SynthParams> {
  return JSON.parse(JSON.stringify(DEFAULT_PARAMS)) as Record<TrackName, SynthParams>;
}

export class WaveCraftApp {
  readonly state: AppState = {
    activeTab: 'daw',
    activeTrack: 'bass',
    bpm: 120,
    isPlaying: false,
    currentStep: 0,
    tracks: emptyTracks(),
    params: cloneParams(),
    presets: [],
    museumEras: {},
    game: { active: false, preset: null, stepIndex: 0, completed: [] },
  };

  readonly audio: AudioRuntime = createAudioRuntime();

  init(): void {
    this.buildSynthControls('synthControls', false);
    this.buildSynthControls('gameSynthControls', true);
    this.syncSynthUI('synthControls', 'bass');
    this.renderSequencer();
    this.renderTimeline();
    this.bindTransport();
    this.bindTabs();
    this.bindTrackTabs();
    this.bindGame();
    this.bindAi();
    this.loadPresets();
    document.body.addEventListener('click', () => this.touchAudio(), { once: true });
  }

  private touchAudio(): void {
    ensureAudio(this.state, this.audio, () => {
      const canvas = $('#scope');
      if (this.audio.analyser) startScope(canvas, this.audio.analyser);
    });
  }

  private bindTransport(): void {
    $('#bpm').addEventListener('input', (e) => {
      const val = +(e.target as HTMLInputElement).value;
      this.state.bpm = val;
      $('#bpmVal').textContent = String(val);
    });
    $('#btnPlay').addEventListener('click', () => this.startTransport());
    $('#btnStop').addEventListener('click', () => this.stopTransport());
  }

  private bindTabs(): void {
    $$<HTMLButtonElement>('.tab').forEach((t) =>
      t.addEventListener('click', () => this.switchTab(t.dataset.tab as TabId)),
    );
  }

  private bindTrackTabs(): void {
    $('#trackTabs').addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.track-tab');
      if (!btn || this.state.game.active) return;
      this.state.activeTrack = btn.dataset.track as TrackName;
      $$('#trackTabs .track-tab').forEach((b) => b.classList.toggle('active', b === btn));
      $('#activeTrackLabel').textContent = this.capitalize(this.state.activeTrack);
      this.syncSynthUI('synthControls', this.state.activeTrack);
    });
  }

  private bindGame(): void {
    $('#btnStartChallenge').addEventListener('click', () => this.startChallenge());
  }

  private bindAi(): void {
    $('#btnGenerate').addEventListener('click', () => this.onGenerateLoop());
    $('#aiToggle').addEventListener('click', () => $('#aiDrawer').classList.toggle('collapsed'));
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  switchTab(tab: TabId): void {
    this.state.activeTab = tab;
    $$('.tab').forEach((t) => t.classList.toggle('active', (t as HTMLElement).dataset.tab === tab));
    $$('.dashboard').forEach((d) => d.classList.remove('active'));
    $(`#dash-${tab}`).classList.add('active');
  }

  startTransport(): void {
    this.touchAudio();
    if (this.audio.ctx?.state === 'suspended') void this.audio.ctx.resume();
    if (this.state.isPlaying) return;
    this.state.isPlaying = true;
    this.state.currentStep = 0;
    this.audio.nextStepTime = (this.audio.ctx?.currentTime ?? 0) + 0.05;
    this.audio.schedulerTimer = setInterval(() => this.scheduler(), 25);
    $('#btnPlay').classList.add('playing');
  }

  stopTransport(): void {
    this.state.isPlaying = false;
    if (this.audio.schedulerTimer) clearInterval(this.audio.schedulerTimer);
    this.audio.schedulerTimer = null;
    this.state.currentStep = 0;
    this.highlightStep(-1);
    $('#btnPlay').classList.remove('playing');
  }

  private scheduler(): void {
    const ctx = this.audio.ctx;
    if (!ctx) return;
    const stepDur = 60 / this.state.bpm / 4;
    while (this.audio.nextStepTime < ctx.currentTime + this.audio.scheduleAhead) {
      this.scheduleStep(this.state.currentStep, this.audio.nextStepTime);
      this.highlightStep(this.state.currentStep);
      this.state.currentStep = (this.state.currentStep + 1) % STEPS;
      this.audio.nextStepTime += stepDur;
    }
  }

  private scheduleStep(step: number, time: number): void {
    TRACKS.forEach((track) => {
      if (this.state.tracks[track][step]) {
        playNote(this.audio, track, this.state.params[track], time);
      }
    });
  }

  buildSynthControls(containerId: string, isGame: boolean): void {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="control-row"><label>Waveform</label>
        <select id="${containerId}-waveform">${WAVEFORMS.map((w) => `<option value="${w}">${w}</option>`).join('')}</select>
      </div>
      <div class="control-row"><label>Frequency</label>
        <input type="range" id="${containerId}-frequency" min="30" max="1200" value="440" />
        <span id="${containerId}-frequency-val">440</span>
      </div>
      <div class="control-row"><label>Cutoff</label>
        <input type="range" id="${containerId}-cutoff" min="80" max="8000" value="800" />
        <span id="${containerId}-cutoff-val">800</span>
      </div>
      <div class="control-row"><label>Resonance</label>
        <input type="range" id="${containerId}-resonance" min="0" max="15" step="0.1" value="2" />
        <span id="${containerId}-resonance-val">2</span>
      </div>
      <div class="control-row"><label>Stutter</label>
        <input type="range" id="${containerId}-stutterRate" min="0" max="4" step="1" value="0" />
        <span id="${containerId}-stutterRate-val">0</span>
      </div>
      <button class="btn" id="${containerId}-preview" style="margin-top:0.5rem">Preview Note</button>
    `;

    const fields: (keyof SynthParams)[] = ['waveform', 'frequency', 'cutoff', 'resonance', 'stutterRate'];
    fields.forEach((field) => {
      document.getElementById(`${containerId}-${field}`)?.addEventListener('input', (ev) => {
        const input = ev.target as HTMLInputElement | HTMLSelectElement;
        const track = this.resolveControlTrack(isGame);
        const val =
          field === 'waveform'
            ? (input.value as SynthParams['waveform'])
            : field === 'stutterRate'
              ? parseInt(input.value, 10)
              : parseFloat(input.value);
        this.state.params[track][field] = val as never;
        const valEl = document.getElementById(`${containerId}-${field}-val`);
        if (valEl) valEl.textContent = String(val);
        updateFilters(this.audio, track, this.state.params[track]);
        if (isGame && this.state.game.active) this.checkGameStep();
      });
    });

    document.getElementById(`${containerId}-preview`)?.addEventListener('click', () => {
      this.touchAudio();
      const track = this.resolveControlTrack(isGame);
      if (this.audio.ctx) playNote(this.audio, track, this.state.params[track], this.audio.ctx.currentTime);
    });
  }

  private resolveControlTrack(isGame: boolean): TrackName {
    if (isGame && this.state.game.active) {
      return this.state.game.preset?.track ?? this.state.activeTrack;
    }
    return this.state.activeTrack;
  }

  syncSynthUI(containerId: string, track: TrackName): void {
    const p = this.state.params[track];
    const wave = document.getElementById(`${containerId}-waveform`) as HTMLSelectElement | null;
    if (wave) wave.value = p.waveform;
    (['frequency', 'cutoff', 'resonance', 'stutterRate'] as const).forEach((f) => {
      const input = document.getElementById(`${containerId}-${f}`) as HTMLInputElement | null;
      if (input) {
        input.value = String(p[f]);
        const valEl = document.getElementById(`${containerId}-${f}-val`);
        if (valEl) valEl.textContent = String(p[f]);
      }
    });
    updateFilters(this.audio, track, p);
  }

  renderSequencer(): void {
    const grid = $('#sequencerGrid');
    grid.innerHTML = TRACKS.map(
      (track) => `
      <div class="seq-row ${track}">
        <span class="seq-label ${track}">${track}</span>
        ${Array.from({ length: STEPS }, (_, i) =>
          `<button class="step${this.state.tracks[track][i] ? ' on' : ''}" data-track="${track}" data-step="${i}"></button>`,
        ).join('')}
      </div>`,
    ).join('');

    grid.querySelectorAll('.step').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.state.game.active) return;
        const t = (btn as HTMLElement).dataset.track as TrackName;
        const s = +(btn as HTMLElement).dataset.step!;
        this.state.tracks[t][s] = this.state.tracks[t][s] ? 0 : 1;
        btn.classList.toggle('on', !!this.state.tracks[t][s]);
      });
    });
  }

  highlightStep(step: number): void {
    $$('.step').forEach((el) => {
      el.classList.remove('playhead');
      if (+(el as HTMLElement).dataset.step! === step) el.classList.add('playhead');
    });
  }

  loadPattern(data: PatternPayload): void {
    if (data.bpm) {
      this.state.bpm = data.bpm;
      ($('#bpm') as HTMLInputElement).value = String(data.bpm);
      $('#bpmVal').textContent = String(data.bpm);
    }
    if (data.tracks) {
      TRACKS.forEach((t) => {
        if (data.tracks![t]) this.state.tracks[t] = data.tracks![t].map((v) => (v ? 1 : 0));
      });
    }
    this.renderSequencer();
  }

  renderTimeline(): void {
    $('#timeline').innerHTML = ERA_CARDS.map(
      (era) => `
      <div class="era-card" data-era="${era.id}">
        <div class="year">${era.year}</div>
        <h4>${era.title}</h4>
        <p>${era.tag}</p>
        <p style="margin-top:0.5rem;font-size:0.75rem;color:var(--amber)">${era.artists}</p>
      </div>`,
    ).join('');

    $('#timeline').addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.era-card');
      if (!card) return;
      const eraId = (card as HTMLElement).dataset.era as EraId;
      $$('.era-card').forEach((c) => c.classList.toggle('selected', c === card));
      $('#museumPanel').innerHTML = MUSEUM_COPY[eraId] ?? '';
      this.applyMuseumBaseline(eraId);
    });
  }

  applyMuseumBaseline(eraId: EraId): void {
    const era = this.state.museumEras[eraId];
    if (!era?.baseline) return;
    const bl = era.baseline;
    this.loadPattern({ bpm: bl.bpm, tracks: bl.tracks });
    if (bl.activeTrack) {
      this.state.activeTrack = bl.activeTrack;
      $('#activeTrackLabel').textContent = this.capitalize(bl.activeTrack);
      $$('#trackTabs .track-tab').forEach((b) =>
        b.classList.toggle('active', (b as HTMLElement).dataset.track === bl.activeTrack),
      );
    }
    if (bl.params) {
      Object.assign(this.state.params[bl.activeTrack ?? 'bass'], bl.params);
      this.syncSynthUI('synthControls', bl.activeTrack ?? 'bass');
    }
    this.switchTab('daw');
  }

  renderChallengeSelect(): void {
    const sel = $('#challengeSelect') as HTMLSelectElement;
    sel.innerHTML =
      '<option value="">— Select a classic patch —</option>' +
      this.state.presets
        .map((p) => `<option value="${p.id}">${p.name} (${p.year}) — ${p.hardware}</option>`)
        .join('');
  }

  startChallenge(): void {
    const id = ($('#challengeSelect') as HTMLSelectElement).value;
    const preset = this.state.presets.find((p) => p.id === id);
    if (!preset) {
      alert('Select a challenge first.');
      return;
    }

    this.state.game = { active: true, preset, stepIndex: 0, completed: [] };
    const track = preset.track ?? 'bass';
    this.state.params[track] = {
      waveform: 'sine',
      frequency: 440,
      cutoff: 8000,
      resonance: 0,
      stutterRate: 0,
    };

    $('#gameTrackLabel').textContent = this.capitalize(track);
    $('#gameHint').textContent = preset.description;
    $('#successBanner').classList.remove('show');
    this.syncSynthUI('gameSynthControls', track);
    this.renderChecklist();
    this.switchTab('game');
  }

  renderChecklist(): void {
    const preset = this.state.game.preset;
    if (!preset) return;
    $('#checklist').innerHTML = preset.steps
      .map((step, i) => {
        const done = this.state.game.completed.includes(step.id);
        const active = i === this.state.game.stepIndex && !done;
        return `<li class="${done ? 'done' : ''} ${active ? 'active' : ''}" data-step-id="${step.id}">
          ${done ? '✓ ' : active ? '→ ' : ''}${step.instruction}
          ${done && step.theory ? `<span class="theory">${step.theory}</span>` : ''}
        </li>`;
      })
      .join('');
  }

  valuesMatch(
    field: keyof SynthParams,
    current: string | number,
    target: string | number,
    tolerances?: Partial<Record<keyof SynthParams, number>>,
  ): boolean {
    if (field === 'waveform') return current === target;
    const tol =
      tolerances?.[field] ??
      (field === 'stutterRate' ? 0 : field === 'cutoff' ? 100 : 20);
    return Math.abs(Number(current) - Number(target)) <= tol;
  }

  checkGameStep(): void {
    const { preset, stepIndex, completed } = this.state.game;
    if (!preset || stepIndex >= preset.steps.length) return;

    const step = preset.steps[stepIndex];
    const track = preset.track ?? 'bass';
    const current = this.state.params[track][step.field];
    const target = step.target ?? preset.targets[step.field];

    if (this.valuesMatch(step.field, current, target, preset.tolerances)) {
      if (!completed.includes(step.id)) {
        completed.push(step.id);
        this.state.game.stepIndex++;
        this.renderChecklist();
        if (this.state.game.stepIndex >= preset.steps.length) {
          this.onChallengeSuccess(preset);
        }
      }
    }
  }

  onChallengeSuccess(preset: HistoricalPreset): void {
    $('#successBanner').classList.add('show');
    this.state.game.active = false;
    if (preset.successSequence) {
      this.loadPattern(preset.successSequence);
      Object.assign(this.state.params[preset.track], preset.targets);
      this.syncSynthUI('synthControls', preset.track);
      this.state.activeTrack = preset.track;
    }
    if (!this.state.isPlaying) this.startTransport();
    this.switchTab('daw');
  }

  async loadPresets(): Promise<void> {
    try {
      const data = await fetchPresets();
      this.state.presets = data.presets;
      this.state.museumEras = data.museumEras as AppState['museumEras'];
      this.renderChallengeSelect();
    } catch {
      $('#aiStatus').textContent = '⚠ Backend offline. Run: npm run dev';
    }
  }

  async onGenerateLoop(): Promise<void> {
    const prompt = ($('#aiPrompt') as HTMLTextAreaElement).value.trim();
    if (!prompt) return;
    $('#aiStatus').textContent = 'Generating via local Ollama...';
    try {
      const data = await generateLoop(prompt);
      this.loadPattern(data);
      $('#aiStatus').textContent = `✓ Loop from ${data.source}${data.model ? ` (${data.model})` : ''} @ ${data.bpm} BPM`;
      this.switchTab('daw');
      if (!this.state.isPlaying) this.startTransport();
    } catch {
      $('#aiStatus').textContent = '✗ Failed — ensure npm run dev + Ollama are running.';
    }
  }
}
