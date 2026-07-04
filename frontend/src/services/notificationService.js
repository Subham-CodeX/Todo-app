import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Ask Notification Permission
 */
export const requestNotificationPermission = async () => {
  const permission =
    await LocalNotifications.requestPermissions();

  return permission.display === "granted";
};

/**
 * Convert date + time into JavaScript Date
 */
const getNotificationDate = (
  date,
  startTime
) => {
  if (!date || !startTime) return null;

  return new Date(`${date}T${startTime}:00`);
};

/**
 * Schedule Notification
 */
export const scheduleTaskNotification = async (
  task
) => {
  try {
    const notifyAt = getNotificationDate(
      task.date,
      task.startTime
    );

    if (!notifyAt) return;

    if (notifyAt <= new Date()) {
      console.log("Notification skipped.");
      return;
    }

    // Generate numeric notification id
    const notificationId = Date.now();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,

          title: "🔔 Task Reminder",

          body:
            `📌 ${task.title}\n\n` +
            `Priority: ${task.priority}\n` +
            `⏰ ${task.startTime}\n\n` +
            `Your task starts now.`,

          schedule: {
            at: notifyAt,
          },

          smallIcon: "ic_launcher",

          extra: {
            taskId: task._id,
          },
        },
      ],
    });

    console.log(
      "Notification Scheduled:",
      task.title
    );
  } catch (err) {
    console.error(err);
  }
};