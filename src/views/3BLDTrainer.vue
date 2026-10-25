<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { readStorage, writeStorage } from '../utils/storage'

const DEFAULT_COLORS = {
  U: 'white',
  L: 'orange',
  F: 'green',
  R: 'red',
  B: 'blue',
  D: 'yellow',
}

const DEFAULT_CORNERS = {
  UBL: 'A', URB: 'B', UFR: 'C', ULF: 'D',
  LUB: 'E', LFU: 'F', LDF: 'G', LBD: 'H',
  FUL: 'I', FRU: 'J', FDR: 'K', FLD: 'L',
  RUF: 'M', RBU: 'N', RDB: 'O', RFD: 'P',
  BUR: 'Q', BLU: 'R', BDL: 'S', BRD: 'T',
  DFL: 'U', DRF: 'V', DBR: 'W', DLB: 'X',
}

const DEFAULT_EDGES = {
  UB: 'A', UR: 'B', UF: 'C', UL: 'D',
  LU: 'E', LF: 'F', LD: 'G', LB: 'H',
  FU: 'I', FR: 'J', FD: 'K', FL: 'L',
  RU: 'M', RB: 'N', RD: 'O', RF: 'P',
  BU: 'Q', BL: 'R', BD: 'S', BR: 'T',
  DF: 'U', DR: 'V', DB: 'W', DL: 'X',
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('')
const savedSettings = readStorage('3BLD-trainer-settings', {}) ?? {}
const colors = ref({ ...DEFAULT_COLORS, ...(savedSettings.colors ?? {}) })
const corners = ref({ ...DEFAULT_CORNERS, ...(savedSettings.corners ?? {}) })
const edges = ref({ ...DEFAULT_EDGES, ...(savedSettings.edges ?? {}) })
const memoType = ref(savedSettings.testing === 2 ? 2 : 1)
const times = ref(readStorage('3BLD-trainer-times', []))
const selection = ref('')
const startedAt = ref(0)
const result = ref(null)
const settingsOpen = ref(false)
const settingsDraft = ref({
  colors: { ...colors.value },
  corners: { ...corners.value },
  edges: { ...edges.value },
  memoType: memoType.value,
})

if (!Array.isArray(times.value)) times.value = []

let nextTimeout = null

const isCornerMode = computed(() => memoType.value === 1)
const memoMap = computed(() => (isCornerMode.value ? corners.value : edges.value))
const stickers = computed(() => selection.value.split('').map((face) => ({
  face,
  color: colors.value[face] || '#f4f4f4',
})))
const correctTimes = computed(() => times.value.filter((entry) => entry.correct).map((entry) => entry.time))
const averageTime = computed(() => average(correctTimes.value))
const deviation = computed(() => standardDeviation(correctTimes.value))
const accuracy = computed(() => (
  times.value.length ? Math.round((correctTimes.value.length / times.value.length) * 100) : 0
))

function average(values) {
  if (!values.length) return Number.NaN
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function standardDeviation(values) {
  if (!values.length) return Number.NaN
  const mean = average(values)
  const variance = average(values.map((value) => (value - mean) ** 2))
  return Math.sqrt(variance)
}

function formatTime(milliseconds) {
  if (!Number.isFinite(milliseconds)) return '—'
  const total = Math.max(0, Math.floor(milliseconds))
  const fraction = String(total % 1000).padStart(3, '0')
  const seconds = Math.floor(total / 1000)

  if (seconds < 60) return `${seconds}.${fraction}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, '0')
  if (minutes < 60) return `${minutes}:${remainder}.${fraction}`
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}.${fraction}`
}

function saveTimes() {
  writeStorage('3BLD-trainer-times', times.value)
}

function nextMemo() {
  if (nextTimeout) clearTimeout(nextTimeout)
  nextTimeout = null
  result.value = null

  const keys = Object.keys(memoMap.value)
  if (!keys.length) return

  const candidates = keys.filter((key) => key !== selection.value)
  selection.value = candidates[Math.floor(Math.random() * candidates.length)] || keys[0]
  startedAt.value = performance.now()
}

function answerLetter(letter) {
  if (settingsOpen.value || result.value || !selection.value) return

  const expected = String(memoMap.value[selection.value] ?? '').trim().slice(0, 1).toUpperCase()
  const selectedAnswer = String(letter).trim().slice(0, 1).toUpperCase()
  const timeTaken = performance.now() - startedAt.value
  const attempt = {
    time: timeTaken,
    correct: selectedAnswer === expected,
    selection: selection.value,
    selectedAnswer,
    correctAnswer: expected,
  }

  result.value = attempt
  times.value = [attempt, ...times.value]
  saveTimes()
  nextTimeout = setTimeout(nextMemo, 900)
}

function handleKeydown(event) {
  if (
    event.defaultPrevented ||
    settingsOpen.value ||
    event.key.length !== 1 ||
    event.target?.closest?.('input, textarea, select, [contenteditable="true"]')
  ) return

  if (!/^[a-z]$/i.test(event.key)) return
  event.preventDefault()
  answerLetter(event.key)
}

function openSettings() {
  settingsDraft.value = {
    colors: { ...colors.value },
    corners: { ...corners.value },
    edges: { ...edges.value },
    memoType: memoType.value,
  }
  settingsOpen.value = true
}

function closeSettings() {
  settingsOpen.value = false
}

function saveSettings() {
  memoType.value = Number(settingsDraft.value.memoType) === 2 ? 2 : 1
  colors.value = { ...DEFAULT_COLORS, ...settingsDraft.value.colors }
  corners.value = { ...DEFAULT_CORNERS, ...settingsDraft.value.corners }
  edges.value = { ...DEFAULT_EDGES, ...settingsDraft.value.edges }
  writeStorage('3BLD-trainer-settings', {
    colors: colors.value,
    corners: corners.value,
    edges: edges.value,
    testing: memoType.value,
  })
  settingsOpen.value = false
  nextMemo()
}

function deleteTime(index) {
  times.value = times.value.filter((_entry, entryIndex) => entryIndex !== index)
  saveTimes()
}

function clearHistory() {
  if (!times.value.length || !window.confirm('Delete all 3BLD training attempts?')) return
  times.value = []
  saveTimes()
}

onMounted(() => {
  nextMemo()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (nextTimeout) clearTimeout(nextTimeout)
})
</script>

<template>
  <div>
    <header class="page-heading">
      <div class="page-heading-copy">
        <span class="eyebrow">Blindfold practice · 3×3</span>
        <h1>3BLD memo trainer</h1>
        <p>
          Build recognition speed with corner and edge letter schemes. Answer with your keyboard or
          tap a letter below; your attempts are saved locally.
        </p>
      </div>
      <div class="page-heading-actions">
        <button class="button" @click="openSettings"><span aria-hidden="true">⚙</span> Settings</button>
        <button class="button button-primary" @click="nextMemo"><span aria-hidden="true">↻</span> New memo</button>
      </div>
    </header>

    <div class="bld-layout">
      <section class="bld-practice">
        <article class="panel memo-card">
          <div class="memo-target-heading">
            <div>
              <span class="eyebrow">Identify this piece</span>
              <h2 class="section-title">{{ isCornerMode ? 'Corner' : 'Edge' }} memo</h2>
              <p class="memo-target-code">{{ selection || '—' }}</p>
            </div>
            <span class="status-pill" :class="result ? (result.correct ? 'status-live' : 'status-ready') : 'status-ready'">
              <span class="status-dot"></span>
              {{ result ? (result.correct ? 'Correct' : 'Try again next') : 'Your turn' }}
            </span>
          </div>

          <div class="sticker-cluster" :aria-label="`Sticker colors for ${selection}`">
            <div v-for="sticker in stickers" :key="sticker.face" class="sticker-face">
              <span>{{ sticker.face }}</span>
              <div class="sticker" :style="{ backgroundColor: sticker.color }"></div>
            </div>
          </div>

          <div class="answer-display">
            <span>Letter for this piece</span>
            <strong>{{ result?.selectedAnswer || '·' }}</strong>
          </div>
          <p
            v-if="result"
            class="answer-feedback"
            :class="result.correct ? 'correct' : 'incorrect'"
          >
            {{ result.correct ? 'Nice recognition.' : `The correct letter was ${result.correctAnswer}.` }}
            <span class="muted"> · {{ formatTime(result.time) }}</span>
          </p>
          <p v-else class="field-help" style="margin: 13px 0 0">
            Press a letter key, or choose from the letter pad. The next piece appears automatically.
          </p>

          <div class="letter-pad" aria-label="Answer letters">
            <button
              v-for="letter in LETTERS"
              :key="letter"
              class="letter-key"
              :disabled="Boolean(result)"
              @click="answerLetter(letter)"
            >
              {{ letter }}
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Correct avg</span>
              <span class="stat-value">{{ formatTime(averageTime) }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Std. deviation</span>
              <span class="stat-value">{{ formatTime(deviation) }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">{{ times.length ? `${accuracy}%` : '—' }}</span>
            </div>
          </div>
        </article>

        <div class="field-help" style="padding: 0 5px">
          Current scheme: {{ isCornerMode ? 'corners' : 'edges' }} · {{ times.length }} attempts saved on this device.
        </div>
      </section>

      <section class="panel panel-pad">
        <div class="section-heading">
          <div>
            <h2 class="section-title">Attempt history</h2>
            <p class="section-subtitle">Newest first · correct answers are highlighted</p>
          </div>
          <button class="button button-small button-danger" :disabled="!times.length" @click="clearHistory">
            Clear history
          </button>
        </div>

        <div v-if="times.length" class="attempt-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Piece</th>
                <th>Answer</th>
                <th>Time</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(attempt, index) in times" :key="`${attempt.time}-${index}`">
                <td class="numeric">{{ times.length - index }}</td>
                <td class="mono">{{ attempt.selection }}</td>
                <td class="mono">{{ attempt.selectedAnswer }}</td>
                <td class="numeric">{{ formatTime(attempt.time) }}</td>
                <td>
                  <span class="result-tag" :class="{ incorrect: !attempt.correct }">
                    {{ attempt.correct ? 'Correct' : 'Miss' }}
                  </span>
                </td>
                <td>
                  <button class="delete-row" :aria-label="`Delete attempt ${index + 1}`" @click="deleteTime(index)">
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="median-empty">
          <strong>No attempts yet</strong>
          <span>Your recognition times will appear here.</span>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="settingsOpen" class="dialog-backdrop" @click.self="closeSettings">
        <section class="dialog-card dialog-card-wide" role="dialog" aria-modal="true" aria-labelledby="bld-settings-title">
          <header class="dialog-header">
            <div>
              <span class="eyebrow">Personalize your practice</span>
              <h2 id="bld-settings-title" class="dialog-title">Memo settings</h2>
            </div>
            <button class="button button-icon" aria-label="Close settings" @click="closeSettings">×</button>
          </header>

          <form @submit.prevent="saveSettings">
            <div class="dialog-body">
              <label class="field" style="max-width: 300px">
                <span class="field-label">Memo type</span>
                <select v-model.number="settingsDraft.memoType" class="select">
                  <option :value="1">Corners</option>
                  <option :value="2">Edges</option>
                </select>
              </label>

              <div class="scheme-grid">
                <section>
                  <div class="section-heading">
                    <div>
                      <h3 class="section-title">Corner letter scheme</h3>
                      <p class="section-subtitle">Set the letter for each corner position.</p>
                    </div>
                  </div>
                  <div class="scheme-list">
                    <label v-for="position in Object.keys(settingsDraft.corners)" :key="position" class="scheme-input-row">
                      <code>{{ position }}</code>
                      <input v-model="settingsDraft.corners[position]" maxlength="1" :aria-label="`Corner ${position} letter`" />
                    </label>
                  </div>
                </section>

                <section>
                  <div class="section-heading">
                    <div>
                      <h3 class="section-title">Edge letter scheme</h3>
                      <p class="section-subtitle">Set the letter for each edge position.</p>
                    </div>
                  </div>
                  <div class="scheme-list">
                    <label v-for="position in Object.keys(settingsDraft.edges)" :key="position" class="scheme-input-row">
                      <code>{{ position }}</code>
                      <input v-model="settingsDraft.edges[position]" maxlength="1" :aria-label="`Edge ${position} letter`" />
                    </label>
                  </div>
                </section>
              </div>

              <section>
                <div class="section-heading">
                  <div>
                    <h3 class="section-title">Sticker colors</h3>
                    <p class="section-subtitle">Use any valid CSS color name or hex value.</p>
                  </div>
                </div>
                <div class="scheme-list" style="grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 520px">
                  <label v-for="face in Object.keys(settingsDraft.colors)" :key="face" class="scheme-input-row">
                    <code>{{ face }}</code>
                    <input v-model="settingsDraft.colors[face]" style="width: 72px" :aria-label="`${face} face color`" />
                  </label>
                </div>
              </section>
            </div>

            <footer class="dialog-footer">
              <button class="button" type="button" @click="closeSettings">Cancel</button>
              <button class="button button-primary" type="submit">Save settings</button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>
