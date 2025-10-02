import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // New endpoint to register FCM tokens
  app.post("/api/register-fcm-token", async (req, res) => {
    const { token, userId, role } = req.body;

    if (!token || !userId || !role) {
      return res.status(400).send({ message: "Missing token, userId, or role" });
    }

    try {
      await db.collection("fcmTokens").doc(token).set({
        userId,
        role,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(200).send({ message: "FCM token registered successfully" });
    } catch (error) {
      console.error("Error registering FCM token:", error);
      res.status(500).send({ message: "Failed to register FCM token" });
    }
  });

  // New endpoint to notify admins about new bookings
  app.post("/api/notify-admin-new-booking", async (req, res) => {
    const { reservation } = req.body;

    if (!reservation) {
      return res.status(400).send({ message: "Missing reservation data" });
    }

    try {
      const adminTokensSnapshot = await db.collection("fcmTokens").where("role", "==", "admin").get();
      const adminTokens = adminTokensSnapshot.docs.map(doc => doc.id);

      if (adminTokens.length > 0) {
        const message = {
          notification: {
            title: "Reservasi Baru!",
            body: `Reservasi baru untuk ${reservation.labName} pada ${new Date(reservation.date._seconds * 1000).toLocaleDateString()} ${reservation.timeSlot} oleh ${reservation.userName}.`,
          },
          tokens: adminTokens,
        };
        await admin.messaging().sendEachForMulticast(message);
        console.log("Admin notification sent for new booking.");
      }
      res.status(200).send({ message: "Admin notification process initiated" });
    } catch (error) {
      console.error("Error sending admin notification:", error);
      res.status(500).send({ message: "Failed to send admin notification" });
    }
  });

  // New endpoint to notify users about approved/rejected bookings
  app.post("/api/notify-user-booking-status", async (req, res) => {
    const { reservationId, userId, status, labName, date, timeSlot } = req.body;

    if (!reservationId || !userId || !status || !labName || !date || !timeSlot) {
      return res.status(400).send({ message: "Missing reservation details" });
    }

    try {
      const userTokensSnapshot = await db.collection("fcmTokens").where("userId", "==", userId).get();
      const userTokens = userTokensSnapshot.docs.map(doc => doc.id);

      if (userTokens.length > 0) {
        const notificationTitle = status === "approved" ? "Reservasi Disetujui!" : "Reservasi Ditolak!";
        const notificationBody = `Reservasi Anda untuk ${labName} pada ${new Date(date._seconds * 1000).toLocaleDateString()} ${timeSlot} telah ${status}.`;

        const message = {
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          tokens: userTokens,
        };
        await admin.messaging().sendEachForMulticast(message);
        console.log(`User notification sent for booking ${reservationId} status: ${status}.`);
      }
      res.status(200).send({ message: "User notification process initiated" });
    } catch (error) {
      console.error("Error sending user notification:", error);
      res.status(500).send({ message: "Failed to send user notification" });
    }
  });

  return app;
}
