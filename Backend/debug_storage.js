const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkStorage() {
    console.log("1. Starting Storage Check...");

    // Initialize Admin SDK (Copying logic from config/firebase.js)
    try {
        let serviceAccount;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else if (process.env.FIREBASE_PRIVATE_KEY) {
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            };
        }

        if (!serviceAccount) {
            console.error("❌ No Service Account found in .env");
            return;
        }

        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` // Guessing standard bucket name
            });
        }

        console.log("2. Admin SDK Initialized.");
        console.log(`3. Attempting to access bucket: ${admin.storage().bucket().name}`);

        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({ maxResults: 1 });

        console.log("✅ SUCCESS: Successfully connected to Storage Bucket!");
        console.log(`   Found ${files.length} files (listing limit 1).`);
        console.log("   This means the bucket EXISTS and the Backend has permission.");

    } catch (error) {
        console.error("❌ FAILURE: Could not access Storage Bucket.");
        console.error("   Error Details:", error.message);

        if (error.code === 404) {
            console.log("\n⚠️ Bucket does not exist. Attempting to CREATE it programmatically...");
            try {
                const bucket = admin.storage().bucket();
                // Check if we need to specify location. Default is 'US'.
                await bucket.create({ location: 'asia-south1' });
                console.log("✅ AMAZING: Successfully CREATED the bucket via code!");
                console.log("   The 'Unknown Error' in the console doesn't matter anymore.");
                console.log("   Go ahead and try uploading now.");
            } catch (createError) {
                console.error("❌ CREATION FAILED:", createError.message);
                console.log("\nPlan B: You must use Google Cloud Console to create it manually.");
            }
        }
    }
}

checkStorage();
