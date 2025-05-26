import { onMounted, onUnmounted } from 'vue';
import echo from '@/services/echo';
import { useQueueStore } from '@/store/queue';
import { useUserStore } from '@/store/user';

export function useQueueEvents({ onPatientCalled } = {}) {
  const queueStore = useQueueStore();
  const userStore = useUserStore();

  let doctorChannel = null;
  let patientChannel = null;

  function subscribe() {
    const { doctor_id, patient_id } = userStore.user || {};

    if (doctor_id) {
      doctorChannel = echo.private(`queue.doctor.${doctor_id}`)
        .listen('PatientJoinedQueue', e => queueStore.addEntry(e.queue))
        .listen('PatientLeftQueue', e => queueStore.removeEntry(e.queue.id))
        .listen('PatientCalled', e => queueStore.updateEntry(e.queue))
        .listen('QueuePositionChanged', e => queueStore.updateEntry(e.queue))
        .listen('QueueUpdated', e => queueStore.updateEntry(e.queue));
    }
    if (patient_id) {
      patientChannel = echo.private(`queue.patient.${patient_id}`)
        .listen('PatientJoinedQueue', e => queueStore.addEntry(e.queue))
        .listen('PatientLeftQueue', e => queueStore.removeEntry(e.queue.id))
        .listen('PatientCalled', e => {
          queueStore.updateEntry(e.queue);
          if (onPatientCalled) onPatientCalled(e.queue);
        })
        .listen('QueuePositionChanged', e => queueStore.updateEntry(e.queue))
        .listen('QueueUpdated', e => queueStore.updateEntry(e.queue));
    }
  }

  function unsubscribe() {
    const { doctor_id, patient_id } = userStore.user || {};
    if (doctor_id) echo.leave(`private-queue.doctor.${doctor_id}`);
    if (patient_id) echo.leave(`private-queue.patient.${patient_id}`);
  }

  onMounted(subscribe);
  onUnmounted(unsubscribe);
} 