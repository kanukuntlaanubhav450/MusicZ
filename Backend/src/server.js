const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
require('./config/firebase'); // Initialize Firebase

const server = app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});

// Keep process alive (prevent event loop drain)
setInterval(() => { }, 1000 * 60 * 60);
