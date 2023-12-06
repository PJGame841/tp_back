import express from "express";
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import Logger from './services/logger';
import dbLoader, {isConnected} from './loaders/db';
import routesLoader from './loaders/routes';
import envLoader from './loaders/env';
import swaggerLoder from './loaders/swagger';

envLoader();

const app = express();
const logger = new Logger().getInstance();

(async () => {
    await dbLoader();
})();

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('tiny'));
app.use(bodyParser.json());

routesLoader(app);
swaggerLoder(app);

const port = process.env.PORT ?? 3000;
export const server = app.listen(port, () => logger.log('info', `Listening on port ${port}`));

export default app;