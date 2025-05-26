import { defineStore } from 'pinia'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    queue: [],
    current: null,
  }),
  actions: {
    setQueue(queue) {
      this.queue = queue
    },
    setCurrent(current) {
      this.current = current
    },
    clearQueue() {
      this.queue = []
      this.current = null
    },
    addEntry(entry) {
      this.queue.push(entry)
    },
    removeEntry(id) {
      this.queue = this.queue.filter(e => e.id !== id)
    },
    updateEntry(entry) {
      const idx = this.queue.findIndex(e => e.id === entry.id)
      if (idx !== -1) this.queue[idx] = entry
    },
  },
}) 