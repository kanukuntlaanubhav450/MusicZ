const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
require('./config/firebase'); // Initialize Firebase

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});
