import swaggerUI from "swagger-ui-express";
import {Express} from "express";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import Logger from "~/services/logger";

const logger = new Logger().getInstance();

export default (app: Express) => {
    const file = fs.readFileSync(path.resolve(__dirname, "../static/swagger.yaml"), 'utf-8');
    const swaggerDocuement = yaml.parse(file);

    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocuement));

    logger.log("info", "Swagger loaded");
}