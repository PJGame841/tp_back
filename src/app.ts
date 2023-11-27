import express from "express";
import helmet from 'helmet';
import morgan from 'morgan';
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('tiny'));

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));