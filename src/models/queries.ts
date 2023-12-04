import {UserModel} from "~/models/user";
import {model, Model, Schema} from "mongoose";


export interface IQuery {
    userId: object;
    query: string;
    lat: string;
    lon: string;
}

export interface IQueryMethods {
    newQuery: (user: UserModel, query: string) => { lat: string, lon: string };
}

export type QueryModel = Model<IQuery, {}, IQueryMethods>

const queryScema = new Schema<IQuery, QueryModel, IQueryMethods>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'pjl_users',
        required: true
    },
    query: {
        type: String,
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

export const Query = model<IQuery, QueryModel>('pjl_userqueries', queryScema);