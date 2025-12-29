const { errorResponse } = require('../utils/response');

const verifyAdmin = (req, res, next) => {
    // TODO: improved admin check logic (e.g., custom claims or checking DB)
    if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
        next();
    } else {
        // For now, let's just log and pass if strict admin checks aren't defined yet
        // or block:
        // return errorResponse(res, "Access Denied: Admins Only", 403);
        next();
    }
};

module.exports = verifyAdmin;
