<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Alg, Move } from 'cubing/alg'
import { connectSmartPuzzle } from 'cubing/bluetooth'
import { cube3x3x3 } from 'cubing/puzzles'
import { TwistyPlayer } from 'cubing/twisty'
import CustomSelector from '../components/AlgTrainer/CustomSelector.vue'
import Settings from '../components/AlgTrainer/Settings.vue'
import { ALG_SETS } from '../components/AlgTrainer/alg_sets'
import {
  algPartToString,
  analyzeAlgProgress,
  buildProcessedAlg,
} from '../utils/algProgress'
import { readStorage, removeStorage, shuffle, writeStorage } from '../utils/storage'

const DEFAULT_SETTINGS = {
  algSet: 'PLL',
  selector: 'random',
  timer: 'browser',
  waitTime: 1000,
  hideAlg: false,
}

function normalizeSettings(value) {
  const result = { ...DEFAULT_SETTINGS, ...(value ?? {}) }
  if (!ALG_SETS[result.algSet]) result.algSet = DEFAULT_SETTINGS.algSet
  if (!['random', 'sequential', 'shuffled', 'custom'].includes(result.selector)) {
    result.selector = DEFAULT_SETTINGS.selector
  }
  if (!['browser', 'cube'].includes(result.timer)) result.timer = DEFAULT_SETTINGS.timer
  result.waitTime = Math.max(0, Math.min(3000, Number(result.waitTime) || 0))
  result.hideAlg = Boolean(result.hideAlg)
  return result
}

function normalizeCustomSet(value) {
  const name = ALG_SETS[value?.name] ? value.name : 'PLL'
  const list = Array.isArray(value?.list)
    ? [...new Set(value.list.filter((index) => Number.isInteger(index) && index >= 0))]
    : [0, 1]
  return { name, list }
}

const algSetNames = Object.keys(ALG_SETS)
const settings = ref(normalizeSettings(readStorage('algTrainerSettings', DEFAULT_SETTINGS)))
const settingsDraft = ref({ ...settings.value })
const customSet = ref(normalizeCustomSet(readStorage('customAlgSet', { name: 'PLL', list: [0, 1] })))
const customOverrides = ref({})
const timesList = ref(readStorage('timesList', []))

if (!Array.isArray(timesList.value)) timesList.value = []

const currentSetName = computed(() => (
  settings.value.selector === 'custom' ? customSet.value.name : settings.value.algSet
))

const currentItems = computed(() => {
  const source = ALG_SETS[currentSetName.value]?.list ?? []
  const items = source.map((item, index) => ({
    ...item,
    index,
    alg: customOverrides.value[item.name] ?? item.alg,
  }))

  if (settings.value.selector !== 'custom') return items

  return customSet.value.list
    .map((index) => items[index])
    .filter(Boolean)
})

const currentItem = shallowRef(null)
const puzzle = shallowRef(null)
const solvedPattern = shallowRef(null)
const initialPattern = shallowRef(null)
const currentPattern = shallowRef(null)
const processedAlg = shallowRef([])
const observedMoves = ref([])
const progress = shallowRef({
  correct: [],
  incorrect: new Alg(),
  partial: [],
  todo: [],
  movesToExecute: [],
  completedMoves: 0,
  totalMoves: 0,
})

const twistyHost = ref(null)
const twistyPlayer = shallowRef(null)
const connection = shallowRef(null)
const connectionName = ref('')
const connectionStatus = ref('disconnected')
const bluetoothSupported = ref(false)
const cubingReady = ref(false)
const loadingError = ref('')
const errorMessage = ref('')
const trainingPhase = ref('loading')
const elapsedMs = ref(0)
const timerStartedAt = ref(null)
const cubeTimerStartedAt = ref(null)
const selectorCursor = shallowRef(null)

const showSettings = ref(false)
const showCustomSelector = ref(false)
const showEditDialog = ref(false)
const editDraft = ref('')
const editError = ref('')
const customEditorSetName = ref('PLL')
const customEditorSelection = ref([])
const customSelectionChanged = ref(false)

let timerInterval = null
let nextCaseTimeout = null

const caseCount = computed(() => currentItems.value.length)
const isTimerRunning = computed(() => timerStartedAt.value !== null)
const progressPercent = computed(() => {
  if (!progress.value.totalMoves) return 0
  return Math.min(100, (progress.value.completedMoves / progress.value.totalMoves) * 100)
})
const statusText = computed(() => {
  if (trainingPhase.value === 'loading') return 'Loading cube'
  if (trainingPhase.value === 'between') return 'Case solved'
  if (trainingPhase.value === 'ready') return 'Choose cases'
  return isTimerRunning.value ? 'In progress' : 'Ready to solve'
})
const statusClass = computed(() => {
  if (trainingPhase.value === 'between') return 'status-done'
  if (isTimerRunning.value) return 'status-live'
  return 'status-ready'
})

function loadOverrides(setName) {
  const value = readStorage(`customAlgs.${setName}`, {})
  customOverrides.value = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function getSelectorCursor(length) {
  const mode = settings.value.selector
  const existing = selectorCursor.value

  if (existing?.mode === mode && existing.length === length) return existing

  const stored = readStorage('selectorState', null)
  if (mode === 'sequential') {
    const canResume = stored && stored.length === length && !Array.isArray(stored.items)
    const start = canResume && Number.isInteger(stored.start)
      ? stored.start
      : Math.floor(Math.random() * length)
    const current = canResume && Number.isInteger(stored.curr) ? stored.curr - 1 : start
    selectorCursor.value = { mode, length, start, curr: Math.max(start, current) }
    return selectorCursor.value
  }

  if (mode === 'shuffled') {
    const validItems = Array.isArray(stored?.items) && stored.items.length === length &&
      new Set(stored.items).size === length &&
      stored.items.every((index) => Number.isInteger(index) && index >= 0 && index < length)
    const items = validItems ? stored.items : shuffle(Array.from({ length }, (_, index) => index))
    const curr = validItems && Number.isInteger(stored.curr) ? Math.max(0, stored.curr - 1) : 0
    selectorCursor.value = { mode, length, items, curr }
    return selectorCursor.value
  }

  selectorCursor.value = null
  removeStorage('selectorState')
  return null
}

function selectItemIndex(length) {
  if (!length) return -1

  if (settings.value.selector === 'sequential') {
    const cursor = getSelectorCursor(length)
    const index = cursor.curr % length
    const nextCursor = { ...cursor, curr: cursor.curr + 1 }
    selectorCursor.value = nextCursor
    writeStorage('selectorState', { length, start: nextCursor.start, curr: nextCursor.curr })
    return index
  }

  if (settings.value.selector === 'shuffled') {
    const cursor = getSelectorCursor(length)
    const index = cursor.items[cursor.curr % length]
    const nextCursor = { ...cursor, curr: cursor.curr + 1 }
    selectorCursor.value = nextCursor
    writeStorage('selectorState', { length, items: nextCursor.items, curr: nextCursor.curr })
    return index
  }

  return Math.floor(Math.random() * length)
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = null
  timerStartedAt.value = null
  cubeTimerStartedAt.value = null
  elapsedMs.value = 0
}

function clearNextCaseTimeout() {
  if (nextCaseTimeout) clearTimeout(nextCaseTimeout)
  nextCaseTimeout = null
}

function renderTwistyPlayer(alg) {
  if (!twistyHost.value) return

  try {
    loadingError.value = ''
    const player = new TwistyPlayer({
      puzzle: '3x3x3',
      alg,
      background: 'none',
      controlPanel: 'none',
      viewerLink: 'none',
    })
    player.style.width = '100%'
    player.style.height = '100%'
    twistyHost.value.replaceChildren(player)
    twistyPlayer.value = player
    player.jumpToEnd({ flash: false })
  } catch (error) {
    loadingError.value = `The cube preview could not be created: ${error.message}`
  }
}

function prepareCase(item) {
  clearNextCaseTimeout()
  resetTimer()
  errorMessage.value = ''
  currentItem.value = item
  trainingPhase.value = 'solving'
  observedMoves.value = []
  try {
    processedAlg.value = buildProcessedAlg(item.alg)
    initialPattern.value = solvedPattern.value.applyAlg(new Alg(item.alg).invert())
  } catch (error) {
    trainingPhase.value = 'ready'
    errorMessage.value = `Could not load ${item.name}: ${error.message}`
    twistyHost.value?.replaceChildren()
    twistyPlayer.value = null
    return
  }
  currentPattern.value = initialPattern.value
  progress.value = analyzeAlgProgress(initialPattern.value, processedAlg.value, [])

  renderTwistyPlayer(new Alg(item.alg).invert())
}

function startNextCase() {
  clearNextCaseTimeout()
  resetTimer()

  if (!currentItems.value.length) {
    currentItem.value = null
    trainingPhase.value = 'ready'
    progress.value = {
      correct: [],
      incorrect: new Alg(),
      partial: [],
      todo: [],
      movesToExecute: [],
      completedMoves: 0,
      totalMoves: 0,
    }
    if (twistyHost.value) twistyHost.value.replaceChildren()
    twistyPlayer.value = null
    return
  }

  const index = selectItemIndex(currentItems.value.length)
  const item = currentItems.value[index]
  if (item) prepareCase(item)
}

function isTargetSolved(pattern) {
  if (!pattern || !solvedPattern.value || !puzzle.value) return false
  const checker = ALG_SETS[currentSetName.value]?.checker

  try {
    return checker ? checker(puzzle.value, pattern, solvedPattern.value) : pattern.isIdentical(solvedPattern.value)
  } catch {
    return false
  }
}

function startTimer(event) {
  if (timerStartedAt.value !== null) return

  timerStartedAt.value = performance.now()
  cubeTimerStartedAt.value = Number.isFinite(event.timeStamp) ? event.timeStamp : null
  timerInterval = setInterval(() => {
    elapsedMs.value = performance.now() - timerStartedAt.value
  }, 10)
}

function stopTimer(event) {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = null

  if (timerStartedAt.value === null) return

  let finalTime = performance.now() - timerStartedAt.value
  if (
    settings.value.timer === 'cube' &&
    Number.isFinite(event?.timeStamp) &&
    Number.isFinite(cubeTimerStartedAt.value)
  ) {
    finalTime = event.timeStamp - cubeTimerStartedAt.value
  }

  elapsedMs.value = Math.max(0, finalTime)
  timerStartedAt.value = null
  cubeTimerStartedAt.value = null
  timesList.value = [
    { time: elapsedMs.value, item: { name: currentItem.value.name, alg: currentItem.value.alg } },
    ...timesList.value,
  ]
  writeStorage('timesList', timesList.value)
}

function scheduleNextCase() {
  clearNextCaseTimeout()
  if (!isTargetSolved(currentPattern.value)) return

  const waitTime = settings.value.waitTime
  if (waitTime === 0) {
    startNextCase()
    return
  }

  nextCaseTimeout = setTimeout(() => {
    nextCaseTimeout = null
    if (trainingPhase.value === 'between' && isTargetSolved(currentPattern.value)) {
      startNextCase()
    }
  }, waitTime)
}

function receiveMove(event) {
  const move = event?.latestAlgLeaf
  if (!(move instanceof Move)) return

  try {
    if (trainingPhase.value === 'between') {
      currentPattern.value = currentPattern.value.applyAlg(new Alg([move]))
      twistyPlayer.value?.experimentalAddMove(move)
      if (isTargetSolved(currentPattern.value)) scheduleNextCase()
      else clearNextCaseTimeout()
      return
    }

    if (trainingPhase.value !== 'solving' || !currentItem.value) return
    startTimer(event)
    currentPattern.value = currentPattern.value.applyAlg(new Alg([move]))
    observedMoves.value = [...observedMoves.value, event]
    progress.value = analyzeAlgProgress(initialPattern.value, processedAlg.value, observedMoves.value)
    twistyPlayer.value?.experimentalAddMove(move)

    if (isTargetSolved(currentPattern.value)) {
      progress.value = {
        ...progress.value,
        correct: processedAlg.value.map(({ move: targetMove }) => targetMove),
        incorrect: new Alg(),
        partial: [],
        todo: [],
        completedMoves: progress.value.totalMoves,
        pattern: currentPattern.value,
      }
      stopTimer(event)
      trainingPhase.value = 'between'
      scheduleNextCase()
    }
  } catch (error) {
    errorMessage.value = `Could not process that move: ${error.message}`
  }
}

async function connectCube() {
  if (connection.value || connectionStatus.value === 'connecting') return
  errorMessage.value = ''

  if (!bluetoothSupported.value) {
    errorMessage.value = 'Bluetooth cube connection requires a browser with Web Bluetooth support, such as Chrome or Edge.'
    return
  }

  connectionStatus.value = 'connecting'
  try {
    const device = await connectSmartPuzzle({ acceptAllDevices: false })
    connection.value = device
    connectionName.value = device.name() || 'Smart cube'
    device.addAlgLeafListener(receiveMove)
    connectionStatus.value = 'connected'
  } catch (error) {
    connectionStatus.value = 'disconnected'
    if (error.name !== 'NotFoundError') {
      errorMessage.value = error.message || 'Could not connect to the smart cube.'
    }
  }
}

function disconnectCube() {
  try {
    connection.value?.disconnect()
  } catch {
    // The cube may already have disconnected from Bluetooth.
  }
  connection.value = null
  connectionName.value = ''
  connectionStatus.value = 'disconnected'
}

function handleKeyboardMove(event) {
  if (
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    showSettings.value ||
    showCustomSelector.value ||
    showEditDialog.value ||
    event.target?.closest?.('input, textarea, select, [contenteditable="true"]')
  ) return

  const family = event.key.toUpperCase()
  if (!'URFDLB'.includes(family) || event.key.length !== 1) return

  event.preventDefault()
  receiveMove({
    latestAlgLeaf: new Move(family, event.shiftKey ? -1 : 1),
    timeStamp: performance.now(),
  })
}

function resetCurrentCase() {
  if (currentItem.value) prepareCase({ ...currentItem.value })
  else startNextCase()
}

function deleteTime(index) {
  timesList.value = timesList.value.filter((_entry, entryIndex) => entryIndex !== index)
  writeStorage('timesList', timesList.value)
}

function formatTime(time) {
  if (!Number.isFinite(time)) return '0.00'
  const milliseconds = Math.max(0, Math.floor(time))
  const fraction = String(milliseconds % 1000).padStart(3, '0')
  const seconds = Math.floor(milliseconds / 1000) % 60
  const minutes = Math.floor(milliseconds / 60000)
  return minutes
    ? `${minutes}:${String(seconds).padStart(2, '0')}.${fraction}`
    : `${seconds}.${fraction}`
}

function selectorProgress() {
  const cursor = selectorCursor.value
  if (!cursor) return null
  if (cursor.mode === 'sequential') {
    return { position: Math.max(0, cursor.curr - cursor.start - 1), total: cursor.length }
  }
  if (cursor.mode === 'shuffled') {
    return { position: Math.max(0, cursor.curr - 1), total: cursor.length }
  }
  return null
}

function openSettings() {
  settingsDraft.value = { ...settings.value }
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
  if (customSelectionChanged.value && settings.value.selector === 'custom') {
    selectorCursor.value = null
    removeStorage('selectorState')
    loadOverrides(currentSetName.value)
    startNextCase()
  }
  customSelectionChanged.value = false
}

function openCustomSelector(setName = settingsDraft.value.algSet) {
  customEditorSetName.value = ALG_SETS[setName] ? setName : settings.value.algSet
  customEditorSelection.value = customSet.value.name === customEditorSetName.value
    ? customSet.value.list.slice()
    : []
  showCustomSelector.value = true
}

function saveCustomSelection(indices) {
  customSet.value = { name: customEditorSetName.value, list: indices }
  customEditorSelection.value = indices.slice()
  writeStorage('customAlgSet', customSet.value)
  customSelectionChanged.value = true
  if (settingsDraft.value.selector === 'custom') settingsDraft.value.algSet = customSet.value.name
  showCustomSelector.value = false
}

function saveSettings(nextSettings) {
  const next = normalizeSettings(nextSettings)
  const resetSession = customSelectionChanged.value ||
    next.algSet !== settings.value.algSet ||
    next.selector !== settings.value.selector

  if (
    resetSession &&
    currentItem.value &&
    (progress.value.completedMoves > 0 || timerStartedAt.value !== null) &&
    !window.confirm('Changing the algorithm set or case order will reset this solve. Continue?')
  ) return

  if (next.selector === 'custom') {
    if (customSet.value.name !== next.algSet) {
      customSet.value = { name: next.algSet, list: [0, 1].filter((index) => ALG_SETS[next.algSet].list[index]) }
      writeStorage('customAlgSet', customSet.value)
    }
    next.algSet = customSet.value.name
  }

  settings.value = next
  settingsDraft.value = { ...next }
  writeStorage('algTrainerSettings', next)
  showSettings.value = false
  customSelectionChanged.value = false

  if (resetSession) {
    selectorCursor.value = null
    removeStorage('selectorState')
    loadOverrides(currentSetName.value)
    startNextCase()
  }
}

function openEditDialog() {
  if (!currentItem.value) return
  editDraft.value = currentItem.value.alg
  editError.value = ''
  showEditDialog.value = true
}

function saveEditedAlgorithm() {
  editError.value = ''
  let candidate

  try {
    candidate = new Alg(editDraft.value.trim())
    const candidateMoves = Array.from(candidate.experimentalLeafMoves())
    if (!candidateMoves.length) throw new Error('Enter at least one move.')
    if (candidateMoves.some((move) => move instanceof Move && !'URFDLBurfdlbxyzMES'.includes(move.family))) {
      throw new Error('Use standard face turns, wide turns, slices, or cube rotations.')
    }

    const start = solvedPattern.value.applyAlg(new Alg(currentItem.value.alg).invert())
    const result = start.applyAlg(candidate)
    if (!isTargetSolved(result) && !window.confirm('This does not appear to solve the case. Save it anyway?')) return
  } catch (error) {
    editError.value = error.message || 'That algorithm could not be parsed.'
    return
  }

  const storedOverrides = readStorage(`customAlgs.${currentSetName.value}`, {})
  const overrides = storedOverrides && typeof storedOverrides === 'object' && !Array.isArray(storedOverrides)
    ? storedOverrides
    : {}
  overrides[currentItem.value.name] = candidate.toString()
  writeStorage(`customAlgs.${currentSetName.value}`, overrides)
  customOverrides.value = overrides
  showEditDialog.value = false
  prepareCase({ ...currentItem.value, alg: candidate.toString() })
}

onMounted(async () => {
  bluetoothSupported.value = typeof navigator !== 'undefined' && 'bluetooth' in navigator
  window.addEventListener('keydown', handleKeyboardMove)
  loadOverrides(currentSetName.value)

  try {
    puzzle.value = await cube3x3x3.kpuzzle()
    solvedPattern.value = puzzle.value.defaultPattern()
    cubingReady.value = true
    startNextCase()
  } catch (error) {
    loadingError.value = `Could not load the 3×3 cube definition: ${error.message}`
    trainingPhase.value = 'ready'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboardMove)
  clearNextCaseTimeout()
  resetTimer()
  disconnectCube()
  twistyPlayer.value?.remove()
})
</script>

<template>
  <div>
    <header class="page-heading">
      <div class="page-heading-copy">
        <span class="eyebrow">Practice mode · 3×3</span>
        <h1>Algorithm trainer</h1>
        <p>
          Drill cases with live move feedback, a smart cube, or your keyboard. Your algorithms and solve
          history stay in this browser.
        </p>
      </div>
      <div class="page-heading-actions">
        <button class="button" @click="openSettings"><span aria-hidden="true">⚙</span> Settings</button>
        <button class="button" :disabled="!cubingReady || !caseCount" @click="startNextCase">
          <span aria-hidden="true">↻</span> Next case
        </button>
      </div>
    </header>

    <div v-if="loadingError" class="notice notice-error" style="margin-bottom: 16px">
      {{ loadingError }}
    </div>
    <div v-if="errorMessage" class="notice notice-error" style="margin-bottom: 16px">
      {{ errorMessage }}
    </div>

    <section class="connection-banner">
      <div class="connection-copy">
        <span class="connection-icon" aria-hidden="true">⌁</span>
        <div>
          <strong>
            {{ connectionStatus === 'connected' ? `Connected · ${connectionName}` : 'Connect a smart cube' }}
          </strong>
          <span>
            {{ connectionStatus === 'connected'
              ? 'Turn the cube to submit moves. The timer starts on your first turn.'
              : 'Or use U R F D L B on your keyboard; hold Shift for an inverse turn.' }}
          </span>
        </div>
      </div>
      <button
        v-if="connectionStatus === 'connected'"
        class="button button-secondary"
        @click="disconnectCube"
      >
        Disconnect
      </button>
      <button
        v-else
        class="button button-secondary"
        :disabled="connectionStatus === 'connecting'"
        @click="connectCube"
      >
        {{ connectionStatus === 'connecting' ? 'Connecting…' : 'Connect cube' }}
      </button>
    </section>

    <div class="alg-layout">
      <div class="alg-main-column">
        <section class="panel panel-pad">
          <div class="alg-toolbar">
            <div class="alg-set-summary">
              <span class="set-chip">{{ currentSetName }}</span>
              <div style="min-width: 0">
                <h2 class="alg-case-name">{{ currentItem?.name || 'No cases selected' }}</h2>
                <p class="alg-case-meta">
                  {{ currentSetName }} · {{ caseCount }} {{ caseCount === 1 ? 'case' : 'cases' }}
                  <template v-if="selectorProgress()">
                    · {{ selectorProgress().position + 1 }}/{{ selectorProgress().total }}
                  </template>
                </p>
              </div>
            </div>
            <div class="alg-toolbar-actions">
              <button
                class="button button-small"
                :disabled="!currentItem"
                title="Edit this algorithm"
                @click="openEditDialog"
              >
                <span aria-hidden="true">✎</span> Edit
              </button>
              <button
                class="button button-small"
                :disabled="!currentItem"
                title="Restart this case"
                @click="resetCurrentCase"
              >
                <span aria-hidden="true">⟲</span> Reset
              </button>
            </div>
          </div>

          <div v-if="currentItem" class="alg-text-card">
            <div class="alg-text-label">
              {{ settings.hideAlg ? 'Target algorithm hidden' : 'Target algorithm · solution' }}
            </div>
            <div v-if="settings.hideAlg" class="alg-text alg-hidden-text" aria-label="Algorithm hidden">
              • • • • • • • •
            </div>
            <div v-else class="alg-text" aria-label="Algorithm progress">
              <span class="move-correct">{{ algPartToString(progress.correct) }}</span>
              <span class="move-incorrect">{{ progress.incorrect.toString() }}</span>
              <span class="move-partial">{{ algPartToString(progress.partial) }}</span>
              <span class="move-todo">{{ algPartToString(progress.todo) }}</span>
            </div>
          </div>

          <div v-else class="empty-state">
            <strong>No cases in this custom list yet</strong>
            <span>Open settings and choose at least one algorithm to practice.</span>
            <button class="button button-small" style="justify-self: center; margin-top: 6px" @click="openSettings">
              Open settings
            </button>
          </div>

          <div class="cube-caption" style="margin-top: 18px">
            <span>{{ statusText }}</span>
            <span class="mono">
              {{ progress.completedMoves }}/{{ progress.totalMoves }} moves
            </span>
          </div>
          <div class="progress-meter" role="progressbar" :aria-valuenow="Math.round(progressPercent)" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>
        </section>

        <section class="panel panel-pad cube-player-card">
          <div class="section-heading">
            <div>
              <h2 class="section-title">Cube preview</h2>
              <p class="section-subtitle">The preview starts at the inverse of the target algorithm.</p>
            </div>
            <span class="status-pill" :class="statusClass"><span class="status-dot"></span>{{ statusText }}</span>
          </div>
          <div class="cube-player-wrap">
            <div ref="twistyHost" class="twisty-host"></div>
            <div v-if="!cubingReady" class="cube-placeholder">
              <span class="mono">Loading cube…</span>
            </div>
            <div v-else-if="!currentItem" class="cube-placeholder">
              <span class="mono">Select a case to begin</span>
            </div>
          </div>
          <div class="cube-caption">
            <span>3×3×3 · interactive preview</span>
            <span>Keyboard: <span class="mono">U R F D L B</span></span>
          </div>
        </section>
      </div>

      <aside class="alg-side-column">
        <section class="panel timer-card">
          <span class="timer-label">Solve timer</span>
          <div class="timer-display" :class="{ 'timer-running': isTimerRunning }">
            {{ formatTime(elapsedMs) }}
          </div>
          <span class="timer-caption">
            {{ trainingPhase === 'between' ? 'Solved · next case coming up' : 'Starts on your first move' }}
          </span>
          <div class="timer-actions">
            <button class="button button-primary" :disabled="!currentItem" @click="resetCurrentCase">
              Restart case
            </button>
            <button class="button" :disabled="!currentItem" @click="startNextCase">Skip</button>
          </div>
        </section>

        <section class="panel panel-pad">
          <div class="section-heading">
            <div>
              <h2 class="section-title">Recent solves</h2>
              <p class="section-subtitle">{{ timesList.length }} recorded in this browser</p>
            </div>
            <span class="status-pill">Local</span>
          </div>
          <div v-if="timesList.length" class="history-list">
            <div v-for="(entry, index) in timesList" :key="`${entry.time}-${index}`" class="history-row">
              <span class="history-case" :title="`${entry.item?.name || 'Case'} · ${entry.item?.alg || ''}`">
                {{ entry.item?.name || 'Case' }}
              </span>
              <span class="history-time">{{ formatTime(entry.time) }}</span>
              <button
                class="history-delete"
                :aria-label="`Delete solve ${index + 1}`"
                title="Delete solve"
                @click="deleteTime(index)"
              >
                ×
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <strong>No solves recorded</strong>
            <span>Finish your first case and it will show up here.</span>
          </div>
        </section>

        <div class="field-help" style="padding: 0 5px">
          Bluetooth needs a secure connection (HTTPS) and a supported browser. Smart cube timing uses
          the cube's move timestamps when available.
        </div>
      </aside>
    </div>

    <Settings
      :open="showSettings"
      :model-value="settingsDraft"
      :alg-set-names="algSetNames"
      @close="closeSettings"
      @save="saveSettings"
      @configure-custom="openCustomSelector"
    />

    <CustomSelector
      :open="showCustomSelector"
      :alg-set="customEditorSetName"
      :model-value="customEditorSelection"
      @close="showCustomSelector = false"
      @save="saveCustomSelection"
    />

    <Teleport to="body">
      <div v-if="showEditDialog" class="dialog-backdrop" @click.self="showEditDialog = false">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="edit-alg-title">
          <header class="dialog-header">
            <div>
              <span class="eyebrow">Personal algorithm</span>
              <h2 id="edit-alg-title" class="dialog-title">Edit {{ currentItem?.name }}</h2>
            </div>
            <button class="button button-icon" aria-label="Close editor" @click="showEditDialog = false">×</button>
          </header>
          <form @submit.prevent="saveEditedAlgorithm">
            <div class="dialog-body">
              <label class="field">
                <span class="field-label">Algorithm</span>
                <textarea v-model="editDraft" class="textarea mono" spellcheck="false"></textarea>
              </label>
              <div class="field-help">
                Your version is saved only in this browser. The trainer checks whether it solves this case.
              </div>
              <div v-if="editError" class="notice notice-error">{{ editError }}</div>
            </div>
            <footer class="dialog-footer">
              <button class="button" type="button" @click="showEditDialog = false">Cancel</button>
              <button class="button button-primary" type="submit">Save algorithm</button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>
