import {Document, model, Model, Schema, Types} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {accessExpire, getSecrets, refreshExpire} from "../services/auth";

export interface IUser {
    username: string;
    password: string;
    email: string;
}

export interface IUserMethods {
    hashPassword(password: string): Promise<void>;
    checkPassword(password: string): Promise<boolean>;
    createTokens(): { accessToken: string, refreshToken: string, expiresIn: number, refreshExpiresIn: number };
}

export type UserModel = Model<IUser, {}, IUserMethods>;

export type UserDocument = Document<unknown, {}, IUser> & Omit<IUser & {_id: Types.ObjectId}, keyof IUserMethods> & IUserMethods;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
})

userSchema.method('hashPassword', async function (password: string){
    this.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND ?? ""));
});
userSchema.method('checkPassword', async function (password: string) {
    return await bcrypt.compare(password, this.password);
})
userSchema.method('createTokens', function () {
    const user = this;
    const { accessSecret, refreshSecret } = getSecrets();

    const accessToken = jwt.sign({ email: user.email }, accessSecret, { expiresIn: accessExpire });
    const refreshToken = jwt.sign({ email: user.email }, refreshSecret, { expiresIn: refreshExpire });

    return { accessToken, refreshToken, expiresIn: accessExpire, refreshExpiresIn: refreshExpire };
})

export const User = model<IUser, UserModel>('pjl_users', userSchema);