import { Habit, useHabitStore } from '../store/useHabitStore';
import { getCurrentHabitDay } from '../utils/habitUtils';

class ReminderService {
  private intervalId: number | null = null;
  private notifiedHabits: Set<string> = new Set(); // Store habitId-day combination

  start() {
    if (this.intervalId) return;
    
    // Check every minute
    this.intervalId = window.setInterval(() => this.checkReminders(), 60000);
    this.checkReminders(); // Initial check
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async requestPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  private checkReminders() {
    const habits = useHabitStore.getState().habits;
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    console.log(`[ReminderService] Checking at ${currentTime}...`);

    habits.forEach(habit => {
      const { reminder, checkIns, id, name } = habit;
      
      if (!reminder || !reminder.enabled) return;

      // Check frequency
      const isWeekday = currentDayOfWeek >= 1 && currentDayOfWeek <= 5;
      const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

      if (reminder.frequency === 'weekdays' && !isWeekday) return;
      if (reminder.frequency === 'weekends' && !isWeekend) return;

      // Check time
      if (reminder.time === currentTime) {
        const currentDay = getCurrentHabitDay(habit);
        const isCompleted = checkIns.some(c => c.day === currentDay);
        // Use separate key for notified to prevent double-buzzing in the same minute
        const notificationKey = `${id}-${currentDay}-${currentTime}`;

        if (!isCompleted && !this.notifiedHabits.has(notificationKey)) {
          console.log(`[ReminderService] Triggering for: ${name}`);
          this.triggerNotification(name);
          this.notifiedHabits.add(notificationKey);
        }
      }
    });

    // Clean up old keys daily (or when reaching limit)
    if (this.notifiedHabits.size > 200) {
      this.notifiedHabits.clear();
    }
  }

  // Helper for testing
  sendTestNotification() {
    if (Notification.permission === "granted") {
      new Notification("HABITRY Test", {
        body: "Your notifications are set up correctly! 🎯",
        icon: "/vite.svg"
      });
    } else {
      alert("Please enable notifications in the header first!");
    }
  }

  private triggerNotification(habitName: string) {
    if (Notification.permission === "granted") {
      new Notification("HABITRY Reminder", {
        body: `Time to focus on your habit: "${habitName}"! 🚀`,
        icon: "/vite.svg" // Fallback to vite logo if no custom icon
      });
    }
  }
}

export const reminderService = new ReminderService();
