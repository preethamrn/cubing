<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: Object, required: true },
  algSetNames: { type: Array, required: true },
})

const emit = defineEmits(['close', 'save', 'configure-custom'])
const draft = ref({})

watch(
  () => props.open,
  (open) => {
    if (open) draft.value = { ...props.modelValue }
  },
)

function save() {
  emit('save', { ...draft.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="emit('close')">
      <section
        class="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alg-settings-title"
      >
        <header class="dialog-header">
          <div>
            <span class="eyebrow">Tune your session</span>
            <h2 id="alg-settings-title" class="dialog-title">Trainer settings</h2>
          </div>
          <button class="button button-icon" aria-label="Close settings" @click="emit('close')">
            ×
          </button>
        </header>

        <form @submit.prevent="save">
          <div class="dialog-body">
            <div class="alg-settings-grid">
              <label class="field">
                <span class="field-label">Algorithm set</span>
                <select v-model="draft.algSet" class="select">
                  <option v-for="name in algSetNames" :key="name" :value="name">{{ name }}</option>
                </select>
              </label>

              <label class="field">
                <span class="field-label">Case order</span>
                <select v-model="draft.selector" class="select">
                  <option value="random">Random</option>
                  <option value="sequential">Sequential</option>
                  <option value="shuffled">Shuffled</option>
                  <option value="custom">Custom list</option>
                </select>
              </label>

              <label class="field">
                <span class="field-label">Timer source</span>
                <select v-model="draft.timer" class="select">
                  <option value="browser">Browser timer</option>
                  <option value="cube">Smart cube timestamps</option>
                </select>
              </label>

              <label class="field">
                <span class="field-label">Pause between cases · {{ draft.waitTime }} ms</span>
                <input
                  v-model.number="draft.waitTime"
                  class="range-input"
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                />
                <span class="field-help">Set to zero to move on as soon as the cube is solved.</span>
              </label>
            </div>

            <label class="checkbox-row">
              <input v-model="draft.hideAlg" type="checkbox" />
              Hide the target algorithm while practicing
            </label>

            <div v-if="draft.selector === 'custom'" class="notice">
              <div class="section-heading" style="margin: 0; align-items: center">
                <div>
                  <strong>Practice a hand-picked set of cases</strong>
                  <div class="field-help" style="margin-top: 4px">
                    Pick cases from {{ draft.algSet }} and save your list in this browser.
                  </div>
                </div>
                <button
                  class="button button-small"
                  type="button"
                  @click="emit('configure-custom', draft.algSet)"
                >
                  Choose cases
                </button>
              </div>
            </div>
          </div>

          <footer class="dialog-footer">
            <button class="button" type="button" @click="emit('close')">Cancel</button>
            <button class="button button-primary" type="submit">Save settings</button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>
