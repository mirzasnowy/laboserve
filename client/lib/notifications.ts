import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestForToken = async (userId: string, role: string) => {
  if (!('serviceWorker' in navigator)) {
    console.log("Service Worker not supported. Push notifications disabled.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, { vapidKey: "BE7u1rar-pRLJ1V87RMr0q5ZZ2OKKzJS2lr7atAhIGT9jb7RIa4D6EEdMzCWMp2CtuXM_62-FoNlJ1dtyu0fcdw" }); // Replace with your VAPID key
      if (currentToken) {
        console.log("FCM registration token:", currentToken);
        // Send this token to your server to save it for sending notifications
        await fetch("/api/register-fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: currentToken, userId, role }),
        });
        console.log("FCM token sent to server.");
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token or sending to server.", err);
  }
};