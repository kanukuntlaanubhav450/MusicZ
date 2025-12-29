const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("Firebase Admin Initialized Successfully");
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT not found in environment. Using mock data mode.");
    }
} catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
}

module.exports = { db };
