import express from "express";
import helmet from 'helmet';
import morgan from 'morgan';
import Logger from './services/logger';
import dbLoader from './loaders/db';
import routesLoader from './loaders/routes';
const app = express();
const logger = new Logger().getInstance();

(async () => {
    await dbLoader();
})();

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('tiny'));

routesLoader(app);

const port = 3000;
app.listen(port, () => logger.log('info', `Listening on port ${port}`));