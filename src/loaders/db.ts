import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import {Dpe} from "~/models/dpe";
import Logger from "~/services/logger";
import * as process from "process";
const logger = new Logger().getInstance();

const createDatabase = async () => {
    const mongod = await MongoMemoryServer.create();
    logger.log('info', "Memory database created, connecting...")

    return mongod.getUri();
}

const importData = async () => {
    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, "../static/dpemini72.csv"))
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", async (row) => {
                const dbDpe = new Dpe({
                    num_departement: row[0],
                    date_reception_dpe: row[1],
                    date_etablissement_dpe: row[2],
                    date_visite_diagnostiqueur: row[3],
                    etiquette_ges: row[4],
                    etiquette_dpe: row[5],
                    annee_construction: row[6],
                    surface_habitable: row[7],
                    adresse: row[8],
                    code_postal: row[9],
                });
                await dbDpe.save();
            })
            .on("end", () => {
                logger.log('info', "Imported dpemini72.csv");
                resolve();
            })
            .on("error", (err) => {
                logger.log('error', "Error while importing dpemini72.csv");
                reject(err);
            });
    });
}

export default async () => {
    let uri = process.env.MONGO_URL;
    if (uri == undefined) {
        uri = await createDatabase();
    }

    return mongoose.connect(uri + "dpe").then(() => {
        logger.log('info', "Connected to MongoDB database ! Uri: " + uri);

        return process.env.MONGO_URL == null ? importData() : null;
    });
}