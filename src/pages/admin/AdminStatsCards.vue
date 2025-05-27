<template>
  <div class="stats-cards-grid">
    <!-- Total Users Card -->
    <div class="stats-card">
      <div class="stats-card-header">
        <div class="stats-card-icon users">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div class="stats-card-info">
          <p class="stats-card-label">Total Users</p>
          <p class="stats-card-value">{{ formatNumber(stats.total_users) }}</p>
        </div>
      </div>
      <div class="stats-card-footer">
        <span class="stats-card-trend positive">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          All registered users
        </span>
      </div>
    </div>

    <!-- Doctors Card -->
    <div class="stats-card">
      <div class="stats-card-header">
        <div class="stats-card-icon doctors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="stats-card-info">
          <p class="stats-card-label">Doctors</p>
          <p class="stats-card-value">{{ formatNumber(stats.total_doctors) }}</p>
        </div>
      </div>
      <div class="stats-card-footer">
        <span class="stats-card-trend positive">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Active medical staff
        </span>
      </div>
    </div>

    <!-- Patients Card -->
    <div class="stats-card">
      <div class="stats-card-header">
        <div class="stats-card-icon patients">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="stats-card-info">
          <p class="stats-card-label">Patients</p>
          <p class="stats-card-value">{{ formatNumber(stats.total_patients) }}</p>
        </div>
      </div>
      <div class="stats-card-footer">
        <span class="stats-card-trend positive">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Registered patients
        </span>
      </div>
    </div>

    <!-- Appointments Card -->
    <div class="stats-card">
      <div class="stats-card-header">
        <div class="stats-card-icon appointments">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6m-6 0l.5-3h5l.5 3" />
          </svg>
        </div>
        <div class="stats-card-info">
          <p class="stats-card-label">Appointments</p>
          <p class="stats-card-value">{{ formatNumber(stats.total_appointments) }}</p>
        </div>
      </div>
      <div class="stats-card-footer">
        <span class="stats-card-trend neutral">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
          Total scheduled
        </span>
      </div>
    </div>

    <!-- Queues Card -->
    <div class="stats-card">
      <div class="stats-card-header">
        <div class="stats-card-icon queues">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stats-card-info">
          <p class="stats-card-label">Active Queues</p>
          <p class="stats-card-value">{{ formatNumber(stats.total_queues) }}</p>
        </div>
      </div>
      <div class="stats-card-footer">
        <span class="stats-card-trend positive">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Currently waiting
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

// Format numbers with commas for better readability
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}
</script>