require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    }
};
