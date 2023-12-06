import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import {Dpe} from "../models/dpe";
import Logger from "../services/logger";
import * as process from "process";
const logger = new Logger().getInstance();

let isLoaded = false;

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
                    "N°_département_(BAN)": row[0],
                    "Date_réception_DPE": row[1],
                    "Date_établissement_DPE": row[2],
                    "Date_visite_diagnostiqueur": row[3],
                    "Etiquette_GES": row[4],
                    "Etiquette_DPE": row[5],
                    "Année_construction": row[6],
                    "Surface_habitable_logement": row[7],
                    "Adresse_(BAN)": row[8],
                    "Code_postal_(BAN)": row[9],
                });
                await dbDpe.save();
            })
            .on("end", () => {
                logger.log('info', "Imported dpemini72.csv");
                isLoaded = true;
                resolve();
            })
            .on("error", (err) => {
                logger.log('error', "Error while importing dpemini72.csv");
                reject(err);
            });
    });
}

export const isConnected = () => {
    return isLoaded;
}

export default async () => {
    let uri = process.env.MONGO_URL;
    if (uri == undefined) {
        uri = (await createDatabase()) + "dpe";
    }

    return mongoose.connect(uri).then(() => {
        logger.log('info', "Connected to MongoDB database ! Uri: " + uri);

        if (process.env.MONGO_URL == null) {
            return importData();
        } else {
            isLoaded = true;
            return;
        }
    });
}