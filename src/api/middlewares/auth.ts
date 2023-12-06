import {NextFunction, Response, Request} from "express";
import jwt from "jsonwebtoken";
import {User, UserDocument} from "../../models/user";
import {getSecrets} from "../../services/auth";

export interface AuthenticatedRequest extends Request {
    user?: UserDocument
}

export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { accessSecret } = getSecrets();

    const bearerHeader = req.get("Authorization");
    if (!bearerHeader) return res.status(401).json({ success: false, message: "No 'Authorization' header found !" });

    const authToken = bearerHeader.split(" ")[1];
    return jwt.verify(authToken, accessSecret, async (err, jwtPayload) => {
        if (err || !jwtPayload) {
            return res.status(401).json({ success: false, message: err ?? "Invalid payload" });
        }

        if (typeof jwtPayload == "string") {
            return res.status(401).json({ success: false, message: "Invalid JWT token" });
        }

        const user = await User.findOne({ email: jwtPayload.email }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
        }

        req.user = user;

        next();
    });
}