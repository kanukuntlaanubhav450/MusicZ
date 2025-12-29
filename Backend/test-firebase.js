const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from current directory
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });
if (envResult.error) {
    console.error("Error loading .env file:", envResult.error);
    process.exit(1);
}

console.log("Environment variables loaded.");
console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
// Don't log full private key/
console.log("Private Key length:", process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0);

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("Using FIREBASE_SERVICE_ACCOUNT variable");
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
        console.log("Using individual env variables");
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
    }

    if (serviceAccount) {
        console.log("Initializing Firebase Admin...");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const db = admin.firestore();
        console.log("Firebase Admin Initialized Successfully!");

        // Try to list collections to verify permissions
        db.listCollections().then(collections => {
            console.log("Connected! Found collections:", collections.map(c => c.id).join(', '));
            process.exit(0);
        }).catch(err => {
            console.error("Initialization successful, but failed to list collections (Permission/Network error):", err.message);
            process.exit(1);
        });

    } else {
        console.warn("No credentials found in environment.");
        process.exit(1);
    }
} catch (error) {
    console.error("Initialization Error:", error);
    process.exit(1);
}
