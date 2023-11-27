import jwt from 'jsonwebtoken';

export const accessExpire = 2 * 60;
export const refreshExpire = 10 * 60;

export const getSecrets = (): { accessSecret: string, refreshSecret: string } => {
    const accessSecret = process.env.ACCESS_SECRET;
    const refreshSecret = process.env.REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
        const errStr = !accessSecret ? "ACCESS_SECRET is not defined ! " : "";
        throw new Error(errStr + (!refreshSecret ? "REFRESH_SECRET is not defined !" : ""));
    }

    return {
        accessSecret,
        refreshSecret
    };
}

export const checkRefresh = (refreshToken: string) => {
    const { refreshSecret } = getSecrets();

    try {
        const jwtPayload = jwt.verify(refreshToken, refreshSecret);
        if (typeof jwtPayload == "string") {
            return {success: false, message: 'Invalid JWT token'};
        }

        return { success: true, payload: jwtPayload };
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

