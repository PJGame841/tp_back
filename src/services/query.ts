
const toRefine: { [key: string]: { action: "original" | "edit", type?: string, interval?: number }} = {
    "N°_département_(BAN)": { action: "original" },
    "Date_réception_DPE": { action: "edit", type: "date", interval: 4 },
    "Date_établissement_DPE": { action: "edit", type: "date", interval: 4 },
    "Date_visite_diagnostiqueur": { action: "edit", type: "date", interval: 4 },
    "Etiquette_GES": { action: "original" },
    "Etiquette_DPE": { action: "original" },
    "Année_construction": { action: "edit", type: "number", interval: 1},
    "Surface_habitable_logement": { action: "edit", type: "number", interval: 10},
    "Adresse_(BAN)": { action: "original" },
    "Code_postal_(BAN)": { action: "original" },
}

export const refineParams = (params: { [key: string]: string }) => {
    const refinedParams: {[key: string]: string | number | { $gte: number, $lte: number } | { $or: { [key:string]: string }[] } } = {...params}; // Clone params
    Object.keys(params).forEach(param => {
        const actions = toRefine[param];
        if (!actions) return;

        const interval = actions.interval ?? 0;

        const val = params[param];
        if (actions.type == "number") {
            refinedParams[param] = {
                $gte: parseInt(params[param]) - interval,
                $lte: parseInt(params[param]) + interval
            };
        } else if (actions.type == "date") {

            const orTable: {[key: string]: string}[] = [];
            for (let i = 0; i <= interval; i++) {
                const date = new Date(val);
                date.setDate(date.getDate() - (interval / 2));
                date.setDate(date.getDate() + i);

                const newDate: {[key: string]: string} = {};
                const day = date.getDate();
                newDate[param] = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (day < 10 ? "0" + day : day);
                orTable.push(newDate);
            }

            refinedParams[param] = {
                $or: orTable
            };
        } else {
            refinedParams[param] = val;
        }
    });

    return refinedParams
}