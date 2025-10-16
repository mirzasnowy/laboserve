const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Callable function for admin notifications
exports.notifyAdminNewBooking = functions.https.onCall(async (data, context) => {
  // Authentication is optional, but if you want to verify the user is an admin:
  // if (!context.auth || context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'Must be an admin to call this function.');
  // }

  const { reservation } = data;

  if (!reservation) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing reservation data');
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

    return { success: true, message: 'Admin notification process initiated' };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send admin notification');
  }
});

// Callable function for user notifications
exports.notifyUserBookingStatus = functions.https.onCall(async (data, context) => {
  // Authentication is optional, but if you want to verify the user is an admin:
  // if (!context.auth || context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'Must be an admin to call this function.');
  // }

  const { reservationId, userId, status, labName, date, timeSlot } = data;

  if (!reservationId || !userId || !status || !labName || !date || !timeSlot) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing reservation details');
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

    return { success: true, message: 'User notification process initiated' };
  } catch (error) {
    console.error('Error sending user notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send user notification');
  }
});

// Callable function for FCM token registration
exports.registerFcmToken = functions.https.onCall(async (data, context) => {
  const { token, userId, role } = data;

  if (!token || !userId || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing token, userId, or role');
  }

  try {
    await db.collection('fcmTokens').doc(token).set({
      userId,
      role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'FCM token registered successfully' };
  } catch (error) {
    console.error('Error registering FCM token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to register FCM token');
  }
});