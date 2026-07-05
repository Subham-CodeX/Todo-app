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
export const scheduleTaskNotification = async (task) => {

  console.log("========== Notification ==========");

  console.log("Task:", task);

  try {

    const notifyAt = getNotificationDate(
      task.date,
      task.startTime
    );

    console.log("Date:", task.date);
    console.log("Start Time:", task.startTime);
    console.log("notifyAt:", notifyAt);
    console.log("Current:", new Date());

    if (!notifyAt) {

      console.log("notifyAt is NULL");

      return;

    }

    if (notifyAt <= new Date()) {

      console.log("Time already passed");

      return;

    }

    const notificationId =
    task._id
      ? Math.abs(
          task._id
            .split("")
            .reduce(
              (a, c) => a + c.charCodeAt(0),
              0
            )
        )
      : Math.floor(Math.random() * 1000000);

    console.log("Notification ID:", notificationId);

    const result =
      await LocalNotifications.schedule({

        notifications: [

          {

            id: notificationId,

            title: "Task Reminder",

            body:
            `📌 ${task.title}\n\n` +
            `Priority: ${task.priority}\n` +
            `⏰ ${task.startTime}\n\n` +
            `Your task starts now.`,

            schedule: {

              at: notifyAt,

            },

          },

        ],

      });

    console.log("Schedule Result:", result);

    console.log("Notification Scheduled Successfully");

  } catch (e) {

    console.error("Notification Error");

    console.error(e);

  }
};