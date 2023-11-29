import {Schema, Number, model, Model} from "mongoose";
import axios from "axios";
import Logger from "~/services/logger";

const logger = new Logger().getInstance();

export interface IDpe {
    num_departement: number;
    date_reception_dpe: string;
    date_etablissement_dpe: string;
    date_visite_diagnostiqueur: string;
    etiquette_ges: string;
    etiquette_dpe: string;
    annee_construction: number;
    surface_habitable: number;
    adresse: string;
    code_postal: number;
}

interface IDpeMethods {
    searchNominatim(): Promise<{ longitude: string, lattitude: string }>;
}

const dpeSchema = new Schema<IDpe>({
    num_departement: { type: Number },
    date_reception_dpe: { type: String },
    date_etablissement_dpe: { type: String },
    date_visite_diagnostiqueur: { type: String },
    etiquette_ges: { type: String },
    etiquette_dpe: { type: String },
    annee_construction: { type: Number },
    surface_habitable: { type: Number },
    adresse: { type: String },
    code_postal: { type: Number },
})
dpeSchema.method('searchNominatim', async function () {
    const adresse_components = this.adresse.split(this.code_postal.toString());
    const street = adresse_components[0].trim();
    const city = adresse_components[1].trim();

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURI(this.adresse)}&format=jsonv2&limit=1`, {
            proxy: {
                protocol: 'http',
                host: 'proxy.univ-lemans.fr',
                port: 3128,
            }
        });
        if (response.data.length === 0) throw new Error("Adresse introuvable");

        const { lon: longitude, lat: latitude } = response.data[0];

        return { longitude, latitude };
    } catch (err: any) {
        logger.log("error", err.message);
        console.log(err);
        return {longitude: null, latitude: null };
    }
});

export type DpeModel = Model<IDpe, {}, IDpeMethods>;

export const Dpe = model<IDpe, DpeModel>('Dpe', dpeSchema);