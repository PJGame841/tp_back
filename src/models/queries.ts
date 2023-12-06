import {UserDocument} from "../models/user";
import {Document, model, Model, Schema, Types} from "mongoose";
import {Dpe} from "../models/dpe";
import Logger from "../services/logger";

const logger = new Logger().getInstance();

export interface IQuery {
    user: object;
    params: object;
    results: [{ dep: object, lat: number, lon: number }];
}

export interface IQueryMethods {
}

export interface QueryModel extends Model<IQuery, {}, IQueryMethods> {
    newQuery: (user: UserDocument, params: object) => Promise<QueryDocument>;
}
export type QueryDocument = Document<unknown, {}, IQuery> & Omit<IQuery & {_id: Types.ObjectId}, keyof IQueryMethods> & IQueryMethods;


const queryScema = new Schema<IQuery, QueryModel, IQueryMethods>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'pjl_users',
        required: true
    },
    results: [{
        dep: {
            type: Schema.Types.ObjectId,
            ref: 'depmini72',
            required: true,
        },
        lat: {
            type: Number,
            required: true
        },
        lon: {
            type: Number,
            required: true
        }
    }],
    params: {
        type: Object,
        required: true,
    },
});
queryScema.static("newQuery", async function (user, params) {
    const deps = await Dpe.find(params);
    logger.log("debug", "Found " + deps.length + " deps !");

    const results = [];
    for (const dep of deps) {
        const { lon, lat } = await dep.searchNominatim();
        if (!lon || !lat) {
            logger.log("debug", "Aucune coordonées trouvées pour le DPE id: " + dep._id);
            continue;
        }

        results.push({ dep: dep._id, lon, lat });
    }
    if (results.length == 0) return null;

    const query = new Query({
        user: user._id,
        params,
        results
    });
    await query.save();

    return query;
})

export const Query = model<IQuery, QueryModel>('pjl_userqueries', queryScema);