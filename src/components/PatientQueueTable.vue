<template>
  <Card title="My Queue Entries">
    <Table
      :columns="queueColumns"
      :data="sortedQueueEntries"
      :loading="loading"
    >
      <template #doctor="{ row }">
        {{ row.doctor?.user?.name || '-' }}
      </template>
      <template #specialization="{ row }">
        {{ row.doctor?.specialization || '-' }}
      </template>
      <template #status="{ row }">
        <span :class="[statusClass(row.status), { 'expired-badge': isQueueEntryExpired(row) }]">
          <template v-if="isQueueEntryExpired(row)">
            <span class="italic text-gray-400 bg-gray-100 px-2 py-1 rounded">Expired</span>
          </template>
          <template v-else>
            {{ row.status }}
          </template>
        </span>
      </template>
      <template #availability="{ row }">
        <ul>
          <li v-for="(a, idx) in parseAvailabilityArray(row.doctor?.availability)" :key="idx">
            {{ a.day }}: {{ a.start }}-{{ a.end }}
          </li>
        </ul>
      </template>
    </Table>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import Table from '@/components/Table.vue'
import { computed } from 'vue'
import { isQueueEntryExpired } from '@/pages/patient/queue.js'
import { statusClass } from '@/pages/patient/status.js'
import { parseAvailabilityArray } from '@/pages/patient/availability.js'

const props = defineProps({
  queueEntries: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  appointments: { type: Array, required: true }
})

const queueColumns = [
  { key: 'doctor', label: 'Doctor' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'position', label: 'Position' },
  { key: 'status', label: 'Status' },
  { key: 'availability', label: 'Availability' }
]

const sortedQueueEntries = computed(() => {
  return [...props.queueEntries].sort((a, b) => {
    const aExpired = isQueueEntryExpired(a, props.appointments)
    const bExpired = isQueueEntryExpired(b, props.appointments)
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    const aDate = a.scheduled_at.includes('T') ? new Date(a.scheduled_at) : new Date(a.scheduled_at.replace(' ', 'T'))
    const bDate = b.scheduled_at.includes('T') ? new Date(b.scheduled_at) : new Date(b.scheduled_at.replace(' ', 'T'))
    return aDate - bDate
  })
})
</script> 