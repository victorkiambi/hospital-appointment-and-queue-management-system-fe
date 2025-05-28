<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-card-body">
        <!-- Header -->
        <div class="auth-header">
          <h1 class="auth-title">MedBook</h1>
          <p class="auth-subtitle">A modern, real-time medical queue and appointment management system</p>
        </div>

        <!-- Welcome Message -->
        <div class="welcome-section">
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"></path>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">For Patients</h3>
                <p class="feature-description">Book appointments and track your queue status in real-time</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <div class="feature-icon">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">For Doctors</h3>
                <p class="feature-description">Manage your schedule and patient appointments efficiently</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">For Admins</h3>
                <p class="feature-description">Comprehensive management and analytics dashboard</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="auth-form">
          <router-link to="/login" class="auth-button-link">
            <button type="button" class="auth-button">
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Sign In to Your Account
              </span>
            </button>
          </router-link>

          <router-link to="/register" class="auth-button-link">
            <button type="button" class="auth-button auth-button-secondary">
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Create New Account
              </span>
            </button>
          </router-link>
        </div>

        <!-- Features -->
        <div class="features-section">
          <div class="features-list">
            <div class="feature-badge">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Real-time Updates
            </div>
            <div class="feature-badge">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Secure & Modern
            </div>
            <div class="feature-badge">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Easy to Use
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional imports needed for this static homepage
</script>

<style scoped>
/* Homepage specific styles */
.welcome-section {
  @apply mb-8;
}

.feature-grid {
  @apply space-y-4;
}

.feature-item {
  @apply flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100;
}

.feature-icon {
  @apply flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white;
}

.feature-content {
  @apply flex-1;
}

.feature-title {
  @apply font-semibold text-gray-800 text-sm mb-1;
}

.feature-description {
  @apply text-xs text-gray-600 leading-relaxed;
}

.auth-button-link {
  @apply block w-full;
  text-decoration: none;
}

.auth-button-secondary {
  @apply mt-3;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.auth-button-secondary:hover:not(:disabled) {
  box-shadow: 0 10px 20px rgba(107, 114, 128, 0.3);
}

.features-section {
  @apply mt-8 pt-6 border-t border-gray-200;
}

.features-list {
  @apply flex flex-wrap justify-center gap-2;
}

.feature-badge {
  @apply flex items-center text-xs px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-medium;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .feature-item {
    @apply flex-col text-center space-x-0 space-y-2;
  }
  
  .feature-icon {
    @apply mx-auto;
  }
}
</style>
