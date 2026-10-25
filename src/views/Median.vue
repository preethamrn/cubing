<script setup>
import { computed, ref } from 'vue'
import { parseMedianResults } from '../utils/median'

const results = ref([])
const search = ref('')
const fileName = ref('')
const errorMessage = ref('')
const isDragging = ref(false)
const fileInput = ref(null)

const visibleResults = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return results.value
  return results.value.filter(({ num, name }) => `${num} ${name}`.toLowerCase().includes(query))
})

function formatMedian(value) {
  return Number.isFinite(value) ? value.toFixed(2) : 'DNF'
}

async function loadFile(file) {
  if (!file) return
  errorMessage.value = ''

  try {
    const parsed = parseMedianResults(await file.text())
    results.value = parsed
    fileName.value = file.name
  } catch (error) {
    results.value = []
    fileName.value = ''
    errorMessage.value = error instanceof SyntaxError
      ? 'This file is not valid JSON.'
      : error.message || 'The selected file could not be read.'
  }
}

function onChooseFile(event) {
  loadFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}
</script>

<template>
  <div>
    <header class="page-heading">
      <div class="page-heading-copy">
        <span class="eyebrow">Competition utility · csTimer</span>
        <h1>Median calculator</h1>
        <p>
          Import a csTimer export to calculate the median of each session's latest 25 solves. Results
          are a quick check, not official competition results.
        </p>
      </div>
      <div v-if="results.length" class="page-heading-actions">
        <button class="button" @click="results = []; fileName = ''; errorMessage = ''">Clear results</button>
      </div>
    </header>

    <div class="median-layout">
      <section class="panel upload-card">
        <div class="section-heading">
          <div>
            <h2 class="section-title">Import session data</h2>
            <p class="section-subtitle">Choose a csTimer backup in JSON format.</p>
          </div>
          <span class="set-chip" aria-hidden="true">JSON</span>
        </div>

        <label
          class="upload-drop"
          :class="{ 'upload-active': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <input ref="fileInput" class="upload-input" type="file" accept=".json,application/json" @change="onChooseFile" />
          <span class="upload-icon" aria-hidden="true">↑</span>
          <strong>{{ fileName || 'Drop your export here' }}</strong>
          <span>Click to browse or drag in a csTimer JSON file.</span>
          <span class="button button-small">Choose file</span>
        </label>

        <div v-if="errorMessage" class="notice notice-error" style="margin-top: 14px">
          {{ errorMessage }}
        </div>
        <div v-else-if="results.length" class="notice" style="margin-top: 14px">
          {{ results.length }} {{ results.length === 1 ? 'session' : 'sessions' }} loaded from {{ fileName }}.
        </div>

        <div class="notice" style="margin-top: 16px">
          The calculator uses each session's most recent 25 solves and includes +2 penalties and DNFs.
          Always verify values against the original timer before submitting results.
        </div>
      </section>

      <section class="panel median-results">
        <div class="panel-pad">
          <div class="section-heading" style="align-items: center; margin-bottom: 0">
            <div>
              <h2 class="section-title">Session results</h2>
              <p class="section-subtitle">{{ results.length ? `${visibleResults.length} shown · newest sessions first` : 'Your medians will appear here.' }}</p>
            </div>
            <input
              v-if="results.length"
              v-model="search"
              class="input median-table-search"
              type="search"
              placeholder="Search sessions…"
              aria-label="Search sessions"
            />
          </div>
        </div>

        <div v-if="visibleResults.length" class="attempt-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Name</th>
                <th>Median (seconds)</th>
                <th>Solves used</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in visibleResults" :key="session.num">
                <td class="numeric">{{ session.num }}</td>
                <td>{{ session.name }}</td>
                <td class="numeric">{{ formatMedian(session.value) }}</td>
                <td class="numeric">{{ session.solveCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="median-empty">
          <span class="upload-icon" aria-hidden="true">⌁</span>
          <strong>{{ results.length ? 'No matching sessions' : 'Waiting for a timer export' }}</strong>
          <span>{{ results.length ? 'Try another search term.' : 'Choose or drop a csTimer JSON file to get started.' }}</span>
        </div>
      </section>
    </div>
  </div>
</template>
