const { admin } = require('../config/firebase');
const { errorResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return errorResponse(res, "Access Denied: No Token Provided", 401);
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return errorResponse(res, "Invalid Token", 401, error);
    }
};

module.exports = verifyToken;
