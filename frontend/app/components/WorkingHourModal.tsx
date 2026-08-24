"use client";
import React, { useState, useEffect } from 'react';
import { X, Clock, Globe, MessageSquare } from 'lucide-react';
import { DayKey, DEFAULT_WORKING_HOURS, WorkingHoursConfig } from '@/lib/types';
import { Card } from './Cards';
import { Btn } from './Button';

interface WorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WorkingHoursConfig) => Promise<void> | void;
  initialConfig?: Partial<WorkingHoursConfig> | null;
}

const DAYS_LABEL: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
  { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
  { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' },
  { value: 'UTC', label: 'UTC' },
];

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<WorkingHoursConfig>(DEFAULT_WORKING_HOURS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        timezone: initialConfig?.timezone || DEFAULT_WORKING_HOURS.timezone,
        workingHours: {
          ...DEFAULT_WORKING_HOURS.workingHours,
          ...initialConfig?.workingHours,
        },
        // autoReplyOutOfHours:
        //   initialConfig?.autoReplyOutOfHours ?? DEFAULT_WORKING_HOURS.autoReplyOutOfHours,
        // outOfHoursMessage:
        //   initialConfig?.outOfHoursMessage || DEFAULT_WORKING_HOURS.outOfHoursMessage,
      });
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleDayToggle = (day: DayKey, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], enabled },
      },
    }));
  };

  const handleTimeChange = (day: DayKey, field: 'start' | 'end', value: string) => {
    setConfig((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Failed to save working hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-xl shadow-2xl border-border bg-background overflow-hidden p-0 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Configure Working Hours
              </h3>
              <p className="text-xs text-muted-foreground">
                Atur jam operasional dan balasan otomatis di luar jam kerja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
            {/* Timezone Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                Zona Waktu (Timezone)
              </label>
              <select
                value={config.timezone}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Days Schedule Table */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Jadwal Jam Kerja
              </label>
              <div className="rounded-lg border border-border divide-y divide-border bg-card">
                {DAYS_LABEL.map(({ key, label }) => {
                  const dayData = config.workingHours[key];
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                        dayData.enabled ? 'bg-transparent' : 'bg-muted/20 opacity-60'
                      }`}
                    >
                      {/* Checkbox & Day Label */}
                      <div className="flex items-center gap-3 w-32">
                        <input
                          type="checkbox"
                          id={`day-${key}`}
                          checked={dayData.enabled}
                          onChange={(e) => handleDayToggle(key, e.target.checked)}
                          className="rounded accent-primary cursor-pointer"
                        />
                        <label
                          htmlFor={`day-${key}`}
                          className="text-xs font-medium text-foreground cursor-pointer select-none"
                        >
                          {label}
                        </label>
                      </div>

                      {/* Time Pickers */}
                      {dayData.enabled ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dayData.start}
                            onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                            className="px-2 py-1 text-xs font-mono rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-xs text-muted-foreground">s/d</span>
                          <input
                            type="time"
                            value={dayData.end}
                            onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                            className="px-2 py-1 text-xs font-mono rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium italic pr-2">
                          Tutup / Off
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto Reply Out of Hours Section */}
            {/* <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  Balasan Otomatis Di Luar Jam Kerja
                </label>
                <input
                  type="checkbox"
                  checked={config.autoReplyOutOfHours}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      autoReplyOutOfHours: e.target.checked,
                    }))
                  }
                  className="rounded accent-primary cursor-pointer"
                />
              </div>

              {config.autoReplyOutOfHours && (
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    placeholder="Masukkan pesan balasan otomatis..."
                    value={config.outOfHoursMessage}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        outOfHoursMessage: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              )}
            </div> */}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3.5 bg-muted/20 shrink-0">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Prosessing...' : 'save'}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
};