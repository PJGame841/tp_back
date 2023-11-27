import {Schema, Number, model} from "mongoose";

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

export const Dpe = model<IDpe>('Dpe', dpeSchema);