import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- KONFIGURASI --- 
const ADMIN_EMAIL = 'adminlaboserve@student.unsika.ac.id';
const ADMIN_PASSWORD = '12345678';

// Pastikan variabel lingkungan GOOGLE_APPLICATION_CREDENTIALS sudah di-set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Error: Environment variable GOOGLE_APPLICATION_CREDENTIALS is not set.');
    console.log('Please set it to the path of your Firebase service account key JSON file.');
    process.exit(1);
}

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();
const db = getFirestore();

const seedAdminUser = async () => {
    console.log(`Checking for existing admin user: ${ADMIN_EMAIL}...`);

    try {
        // 1. Cek apakah pengguna sudah ada di Firebase Auth
        const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log(`User ${ADMIN_EMAIL} already exists in Firebase Auth (UID: ${userRecord.uid}).`);
        
        // 2. Pastikan data di Firestore juga ada dan perannya adalah admin
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists && userDoc.data()?.role === 'admin') {
            console.log('Admin user already has the correct role in Firestore. Nothing to do.');
            return;
        } else {
            console.log('User exists but role in Firestore is incorrect or missing. Updating...');
            await userDocRef.set({
                email: ADMIN_EMAIL,
                role: 'admin',
                displayName: 'Admin Laboserve',
                // Tambahkan field lain yang mungkin diperlukan oleh AppUser type
                uid: userRecord.uid,
                type: 'dosen', // atau tipe default yang sesuai
                npm: null,
                nidn: null,
                kelas: null,
                passwordSet: true, // Anggap sudah di-set karena dibuat via script
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            console.log('Admin user role updated in Firestore.');
        }

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // 3. Jika pengguna tidak ada, buat baru di Auth dan Firestore
            console.log('Admin user not found. Creating new admin user...');
            try {
                const newUserRecord = await auth.createUser({
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    displayName: 'Admin Laboserve',
                });

                console.log(`Successfully created new user in Firebase Auth (UID: ${newUserRecord.uid})`);

                const userDocRef = db.collection('users').doc(newUserRecord.uid);
                await userDocRef.set({
                    uid: newUserRecord.uid,
                    email: ADMIN_EMAIL,
                    role: 'admin',
                    displayName: 'Admin Laboserve',
                    type: 'dosen', // atau tipe default yang sesuai
                    npm: null,
                    nidn: null,
                    kelas: null,
                    passwordSet: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                console.log('Successfully created admin user document in Firestore.');
                console.log('Admin user seeding complete!');

            } catch (creationError) {
                console.error('Error creating new admin user:', creationError);
            }
        } else {
            // Tangani error lain
            console.error('An unexpected error occurred:', error);
        }
    }
};

// Jalankan fungsi seeding
seedAdminUser().catch(err => console.error(err));
