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
  },
}) 