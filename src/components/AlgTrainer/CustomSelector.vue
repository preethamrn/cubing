<script setup>
import { computed, ref, watch } from 'vue'
import { ALG_SETS } from './alg_sets'

const props = defineProps({
  open: { type: Boolean, default: false },
  algSet: { type: String, default: 'PLL' },
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save'])
const search = ref('')
const selected = ref([])

const cases = computed(() => ALG_SETS[props.algSet]?.list ?? [])
const filteredCases = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return cases.value.map((item, index) => ({ ...item, index }))

  return cases.value
    .map((item, index) => ({ ...item, index }))
    .filter(({ name, alg }) => `${name} ${alg}`.toLowerCase().includes(query))
})

watch(
  () => [props.open, props.algSet, props.modelValue],
  ([open]) => {
    if (open) {
      search.value = ''
      selected.value = props.modelValue.filter((index) => Number.isInteger(index))
    }
  },
  { deep: true },
)

function toggleCase(index) {
  selected.value = selected.value.includes(index)
    ? selected.value.filter((value) => value !== index)
    : [...selected.value, index]
}

function selectVisible(shouldSelect) {
  const visibleIndices = new Set(filteredCases.value.map(({ index }) => index))
  selected.value = shouldSelect
    ? [...new Set([...selected.value, ...visibleIndices])]
    : selected.value.filter((index) => !visibleIndices.has(index))
}

function save() {
  emit('save', [...selected.value].sort((a, b) => a - b))
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="emit('close')">
      <section
        class="dialog-card dialog-card-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-cases-title"
      >
        <header class="dialog-header">
          <div>
            <span class="eyebrow">Custom practice</span>
            <h2 id="custom-cases-title" class="dialog-title">Choose {{ algSet }} cases</h2>
          </div>
          <span class="status-pill status-live">{{ selected.length }} selected</span>
        </header>

        <div class="dialog-body">
          <label class="field">
            <span class="field-label">Find an algorithm</span>
            <input
              v-model="search"
              class="input"
              type="search"
              placeholder="Search by case name or moves…"
            />
          </label>

          <div class="section-heading" style="margin: 0; align-items: center">
            <p class="section-subtitle" style="margin: 0">
              {{ filteredCases.length }} of {{ cases.length }} cases
            </p>
            <div style="display: flex; gap: 7px">
              <button class="button button-small" @click="selectVisible(true)">Select visible</button>
              <button class="button button-small" @click="selectVisible(false)">Clear visible</button>
            </div>
          </div>

          <div v-if="filteredCases.length" class="custom-case-list">
            <label v-for="item in filteredCases" :key="item.index" class="custom-case-row">
              <input
                type="checkbox"
                :checked="selected.includes(item.index)"
                @change="toggleCase(item.index)"
              />
              <span class="custom-case-name">{{ item.name }}</span>
              <span class="custom-case-alg">{{ item.alg }}</span>
            </label>
          </div>
          <div v-else class="empty-state">
            <strong>No matching algorithms</strong>
            <span>Try a different search.</span>
          </div>
        </div>

        <footer class="dialog-footer">
          <button class="button" @click="emit('close')">Cancel</button>
          <button class="button button-primary" @click="save">Save case list</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
