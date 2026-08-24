export interface DaySchedule {
  enabled: boolean;
  start: string; // Format "HH:mm" e.g., "08:00"
  end: string;   // Format "HH:mm" e.g., "17:00"
}

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WorkingHoursConfig {
  timezone: string;
  workingHours: Record<DayKey, DaySchedule>;
  // autoReplyOutOfHours: boolean;
  // outOfHoursMessage: string;
}

export const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  timezone: 'Asia/Jakarta',
  workingHours: {
    monday: { enabled: true, start: '08:00', end: '17:00' },
    tuesday: { enabled: true, start: '08:00', end: '17:00' },
    wednesday: { enabled: true, start: '08:00', end: '17:00' },
    thursday: { enabled: true, start: '08:00', end: '17:00' },
    friday: { enabled: true, start: '08:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '15:00' },
    sunday: { enabled: false, start: '00:00', end: '00:00' },
  },
  // autoReplyOutOfHours: true,
  // outOfHoursMessage: 'Saat ini layanan kami sedang di luar jam operasional. Pesan Anda akan dibalas pada jam kerja berikutnya.',
};