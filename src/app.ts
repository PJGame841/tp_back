import express from "express";
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import Logger from './services/logger';
import dbLoader from './loaders/db';
import routesLoader from './loaders/routes';
import envLoader from './loaders/env';
const app = express();
const logger = new Logger().getInstance();

(async () => {
    await dbLoader();
    envLoader();
})();

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('tiny'));
app.use(bodyParser.json());

routesLoader(app);

const port = 3000;
app.listen(port, () => logger.log('info', `Listening on port ${port}`));