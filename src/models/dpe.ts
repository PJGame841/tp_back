import {Schema, Number, model, Model, Document, Types} from "mongoose";
import axios from "axios";
import Logger from "~/services/logger";
import * as process from "process";

const logger = new Logger().getInstance();

export interface IDpe {
    "N°_département_(BAN)": number,
    "Date_réception_DPE": string,
    "Date_établissement_DPE": string,
    "Date_visite_diagnostiqueur": string,
    "Etiquette_GES": string,
    "Etiquette_DPE": string,
    "Année_construction": number,
    "Surface_habitable_logement": number,
    "Adresse_(BAN)": string,
    "Code_postal_(BAN)": number,
}

interface IDpeMethods {
    searchNominatim(): Promise<{ lon: string, lat: string }>;
}

export type DpeModel = Model<IDpe, {}, IDpeMethods>;

export type DpeDocument = Document<unknown, {}, IDpe> & Omit<IDpe & {_id: Types.ObjectId}, keyof IDpeMethods> & IDpeMethods;

const dpeSchema = new Schema<IDpe>({
    "N°_département_(BAN)": { type: Number },
    "Date_réception_DPE": { type: String },
    "Date_établissement_DPE": { type: String },
    "Date_visite_diagnostiqueur": { type: String },
    "Etiquette_GES": { type: String },
    "Etiquette_DPE": { type: String },
    "Année_construction": { type: Number },
    "Surface_habitable_logement": { type: Number },
    "Adresse_(BAN)": { type: String },
    "Code_postal_(BAN)": { type: Number },
})
dpeSchema.method('searchNominatim', async function () {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURI(this["Adresse_(BAN)"])}&format=jsonv2&limit=1`, !process.env.USE_UNIV_PROXY ? {
            proxy: {
                protocol: 'http',
                host: 'proxy.univ-lemans.fr',
                port: 3128,
            }
        } : {});
        if (response.data.length === 0) throw new Error("Adresse introuvable");

        logger.log("debug", "Réponse de nominatim sur l'addresse " + this["Adresse_(BAN)"] + ": " + response.data);
        const { lon, lat } = response.data[0];

        return { lon, lat };
    } catch (err: any) {
        logger.log("error", err.message);
        console.log(err);
        return {lon: null, lat: null };
    }
});

export const Dpe = model<IDpe, DpeModel>('depmini72', dpeSchema);