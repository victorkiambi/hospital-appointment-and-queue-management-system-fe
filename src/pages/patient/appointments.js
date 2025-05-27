export function isAppointmentExpired(appt) {
  if (appt.status === 'completed' || appt.status === 'cancelled') return false;
  let apptDate;
  try {
    apptDate = appt.scheduled_at.includes('T') ? new Date(appt.scheduled_at) : new Date(appt.scheduled_at.replace(' ', 'T'));
  } catch {
    return false;
  }
  return apptDate < new Date();
}

export function canCancelAppointment(appt, cancellingAppointments = new Set()) {
  return (appt.status === 'scheduled' || appt.status === 'expired') && 
         appt.status !== 'completed' && 
         appt.status !== 'cancelled' && 
         !cancellingAppointments.has(appt.id);
} 