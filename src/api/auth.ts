import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "../api/middlewares/auth";
import {User} from "../models/user";
import {checkRefresh} from "../services/auth";
import Logger from "../services/logger";

const router = Router();
const logger = new Logger().getInstance();

router.get("/me", isAuthenticated, (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(404).json({ success: false, message: "Vous n'êtes pas connecté !" });

    res.json({ success: true, data: req.user });
});

const loginErrorMessage = "Mauvaise addresse mail ou mauvais mot de passe !";
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    logger.log("debug", "New login request, checking existing of email & password");
    if (!email) return res.status(401).json({ success: false, message: loginErrorMessage });
    if (!password) return res.status(401).json({ success: false, message: loginErrorMessage });
    logger.log("debug", "Valid email & password from request");

    const user = await User.findOne({ email });
    logger.log("debug", "User: " + user + " for email: " + email);
    if (!user) return res.status(401).json({ success: false, message: loginErrorMessage });

    if (!(await user.checkPassword(password))) {
        logger.log("debug", "Invalid password !");
        return res.status(401).json({ success: false, message: loginErrorMessage });
    }

    return res.json({
        success: true,
        data: {
            user,
            tokens: {
                ...user.createTokens()
            }
        }
    });
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Veuillez fournir un nom d'utilisateur" });
    if (!email) return res.status(400).json({ success: false, message: "Veuillez fournir une adresse mail" });
    if (!password) return res.status(400).json({ success: false, message: "Veuillez fournir un mot de passe" });

    const user = new User({ username, email });
    await user.hashPassword(password);
    try {
        await user.save();
        return res.json({
            success: true,
            data: {
                user,
                tokens: {
                    ...user.createTokens()
                }
            }
        });
    } catch (error: any) {
        return res.status(400).json({success: false, message: error.message});
    }
});


router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    const isValid = checkRefresh(refreshToken);
    if (!isValid.success || !isValid.payload) {
        return res.status(401).json(isValid);
    }

    const user = await User.findOne({ email: isValid.payload.email });
    if (!user) return res.status(404).json({ success: false, message: "L'utilisateur n'existe plus !" });

    res.json({
        success: true, data: {
            user,
            tokens: {...user.createTokens()}
        }
    });
});

export default router;