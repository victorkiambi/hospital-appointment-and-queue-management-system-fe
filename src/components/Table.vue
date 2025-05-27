<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50/50">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key" 
            class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
          >
            {{ col.label }}
          </th>
          <th 
            v-if="$slots.actions" 
            class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100/70">
        <tr v-if="loading" class="animate-pulse">
          <td 
            :colspan="columns.length + ($slots.actions ? 1 : 0)" 
            class="text-center py-12 text-gray-500"
          >
            <div class="inline-flex items-center space-x-2">
              <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span class="text-sm font-medium">Loading...</span>
            </div>
          </td>
        </tr>
        <tr v-else-if="!data.length">
          <td 
            :colspan="columns.length + ($slots.actions ? 1 : 0)" 
            class="text-center py-12 text-gray-400"
          >
            <div class="space-y-2">
              <svg v-if="!hasFilters" class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p v-if="!hasFilters" class="text-sm font-medium">No data found</p>
              <p v-else class="text-sm font-medium">No results match your filters</p>
              <p v-if="!hasFilters" class="text-xs text-gray-400">There are no records to display at this time.</p>
              <p v-else class="text-xs text-gray-400">Try adjusting your search or filters</p>
              <button
                v-if="hasFilters && clearFilters"
                @click="clearFilters"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </td>
        </tr>
        <tr 
          v-else 
          v-for="(row, index) in data" 
          :key="row.id || row.key || index"
          class="transition-colors duration-200 hover:bg-gray-50/50"
        >
          <td 
            v-for="col in columns" 
            :key="col.key" 
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
          >
            <slot :name="col.key" :row="row" :value="row[col.key]">
              <span class="font-medium" v-if="col.key === 'name' || col.key === 'title'">
                {{ row[col.key] || '-' }}
              </span>
              <span v-else>
                {{ row[col.key] || '-' }}
              </span>
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center justify-end space-x-2">
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { 
    type: Array, 
    required: true,
    validator: (columns) => {
      return columns.every(col => col.key && col.label)
    }
  },
  data: { 
    type: Array, 
    default: () => [] 
  },
  loading: { 
    type: Boolean, 
    default: false 
  },
  hasFilters: {
    type: Boolean,
    default: false
  },
  clearFilters: {
    type: Function,
    default: null
  }
})
</script>