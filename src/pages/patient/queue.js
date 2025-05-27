export function isQueueEntryExpired(entry, appointments) {
  if (entry.status === 'completed' || entry.status === 'cancelled') return false;
  if (entry.appointment_id) {
    const associatedAppointment = appointments.find(appt => appt.id === entry.appointment_id);
    if (associatedAppointment) {
      return isAppointmentExpired(associatedAppointment);
    }
  }
  if (entry.scheduled_at) {
    let entryDate;
    try {
      entryDate = entry.scheduled_at.includes('T') ? new Date(entry.scheduled_at) : new Date(entry.scheduled_at.replace(' ', 'T'));
      return entryDate < new Date();
    } catch {
    }
  }
  if (entry.created_at) {
    let createdDate;
    try {
      createdDate = entry.created_at.includes('T') ? new Date(entry.created_at) : new Date(entry.created_at.replace(' ', 'T'));
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return createdDate < oneDayAgo;
    } catch {
    }
  }
  return false;
}
import { isAppointmentExpired } from './appointments.js';