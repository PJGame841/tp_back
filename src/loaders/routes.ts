import {Express} from "express";
import Logger from "~/services/logger";

const logger = new Logger().getInstance();

const basePath = '/api/v1';

export default (app: Express) => {
    logger.log('info', 'Registering routes');

    app.use(basePath + '/auth', require('../api/auth').default);
}