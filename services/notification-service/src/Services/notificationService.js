const redis = require("../Config/redis.js");
const cron = require("node-cron");

 const createNotification = async (userId, message) => {
  const notification = {
    message,
    timestamp: new Date().toISOString(),
  };
  await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));
};

 const getNotifications = async (userId) => {
  const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
  return notifications.map(notification => JSON.parse(notification));
};

 const createScheduledNotification = async (userId, message, deadline) => {
  const timestamp = new Date(deadline).getTime();
  if (timestamp <= Date.now()) {
    throw new Error("❌ Deadline must be in the future!");
  }

  const notificationKey = `scheduled:${userId}:${timestamp}`;
  
   await redis.set(
    notificationKey,
    JSON.stringify({ userId, message, deadline }),
    "EX",
    Math.floor((timestamp - Date.now()) / 1000)
  );

  console.log(`✅ Scheduled notification stored: ${notificationKey}`);
  return { userId, message, deadline };
};

 const sendScheduledNotification = async (userId, message) => {
  console.log(`📢 Sending scheduled notification to User ${userId}: ${message}`);
  await createNotification(userId, message); 
};

 cron.schedule("* * * * *", async () => {
  console.log("🔍 Checking for scheduled messages...");

  const keys = await redis.keys("scheduled:*");
  for (const key of keys) {
    const notificationData = await redis.get(key);
    if (notificationData) {
      const { userId, message, deadline } = JSON.parse(notificationData);
      if (new Date(deadline) <= new Date()) {
        await sendScheduledNotification(userId, message);
        await redis.del(key); 
      }
    }
  }
});

module.exports = {
  createNotification,
  getNotifications,
  createScheduledNotification,
};
