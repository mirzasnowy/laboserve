const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

exports.notifyAdminNewBooking = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { reservation } = req.body;

  if (!reservation) {
    return res.status(400).send({ message: 'Missing reservation data' });
  }

  try {
    // Get admin FCM tokens from Firestore
    const adminTokensSnapshot = await db.collection('fcmTokens').where('role', '==', 'admin').get();
    const adminTokens = adminTokensSnapshot.docs.map(doc => doc.id);

    if (adminTokens.length > 0) {
      const message = {
        notification: {
          title: 'Reservasi Baru!',
          body: `Reservasi baru untuk ${reservation.labName} pada ${new Date(reservation.date._seconds * 1000).toLocaleDateString()} ${reservation.timeSlot} oleh ${reservation.userName}.`,
          icon: '/favicon.ico',
        },
        data: {
          click_action: '/admin',
          reservation_id: reservation.id || '',
          lab_id: reservation.labId || '',
          user_id: reservation.userId || '',
        },
        tokens: adminTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Admin notification sent for new booking:', response);
    }

    res.status(200).send({ message: 'Admin notification process initiated' });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    res.status(500).send({ message: 'Failed to send admin notification' });
  }
});

exports.notifyUserBookingStatus = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { reservationId, userId, status, labName, date, timeSlot } = req.body;

  if (!reservationId || !userId || !status || !labName || !date || !timeSlot) {
    return res.status(400).send({ message: 'Missing reservation details' });
  }

  try {
    // Get user FCM tokens from Firestore
    const userTokensSnapshot = await db.collection('fcmTokens').where('userId', '==', userId).get();
    const userTokens = userTokensSnapshot.docs.map(doc => doc.id);

    if (userTokens.length > 0) {
      const notificationTitle = status === 'approved' ? 'Reservasi Disetujui!' : 'Reservasi Ditolak!';
      const notificationBody = `Reservasi Anda untuk ${labName} pada ${new Date(date._seconds * 1000).toLocaleDateString()} ${timeSlot} telah ${status}.`;

      const message = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
          icon: '/favicon.ico',
        },
        data: {
          click_action: '/history-reservation',
          reservation_id: reservationId || '',
          lab_name: labName || '',
          status: status || '',
        },
        tokens: userTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`User notification sent for booking ${reservationId} status: ${status}:`, response);
    }

    res.status(200).send({ message: 'User notification process initiated' });
  } catch (error) {
    console.error('Error sending user notification:', error);
    res.status(500).send({ message: 'Failed to send user notification' });
  }
});

exports.registerFcmToken = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { token, userId, role } = req.body;

  if (!token || !userId || !role) {
    return res.status(400).send({ message: 'Missing token, userId, or role' });
  }

  try {
    await db.collection('fcmTokens').doc(token).set({
      userId,
      role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send({ message: 'FCM token registered successfully' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).send({ message: 'Failed to register FCM token' });
  }
});