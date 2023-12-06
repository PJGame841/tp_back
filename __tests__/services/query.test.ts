import {refineParams} from "../../src/services/query";

describe("Refine params", () => {
    it("should refine params", () => {
        const params = {
            "N°_département_(BAN)": "72",
            "Date_réception_DPE": "2023-12-06",
            "Etiquette_GES": "A",
            "Année_construction": "2000",
            "Surface_habitable_logement": "100",
        }
        const newParams = refineParams(params);
        expect(newParams).toEqual({
            "N°_département_(BAN)": "72",
            "Date_réception_DPE": { $or: [
                {"Date_réception_DPE": "2023-12-04"},
                {"Date_réception_DPE": "2023-12-05"},
                {"Date_réception_DPE": "2023-12-06"},
                {"Date_réception_DPE": "2023-12-07"},
                {"Date_réception_DPE": "2023-12-08"},
            ]},
            "Etiquette_GES": "A",
            "Année_construction": { $gte: 1999, $lte: 2001 },
            "Surface_habitable_logement": { $gte: 90, $lte: 110 },
        });
    })
})