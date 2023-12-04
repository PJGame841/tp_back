import {UserDocument} from "~/models/user";
import {Document, model, Model, Schema, Types} from "mongoose";
import {DpeDocument} from "~/models/dpe";


export interface IQuery {
    user: object;
    dep: object;
    lat: string;
    lon: string;
}

export interface IQueryMethods {
}

export interface QueryModel extends Model<IQuery, {}, IQueryMethods> {
    newQuery: (user: UserDocument, Dpe: DpeDocument) => Promise<QueryDocument>;
}
export type QueryDocument = Document<unknown, {}, IQuery> & Omit<IQuery & {_id: Types.ObjectId}, keyof IQueryMethods> & IQueryMethods;


const queryScema = new Schema<IQuery, QueryModel, IQueryMethods>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'pjl_users',
        required: true
    },
    dep: {
        type: Schema.Types.ObjectId,
        ref: 'depmini72',
        required: true,
    },
    lat: {
        type: String,
        required: true,
    },
    lon: {
        type: String,
        required: true
    }
});
queryScema.static("newQuery", async function (user, dpe) {
    const { lon, lat } = await dpe.searchNominatim();

    if (!lon || !lat) return null;

    const query = new Query({
        user: user._id,
        dep: dpe._id,
        lat: lat,
        lon: lon
    });
    await query.save();

    return query;
})

export const Query = model<IQuery, QueryModel>('pjl_userqueries', queryScema);