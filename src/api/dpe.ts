import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "../api/middlewares/auth";
import {Query} from "../models/queries";
import Logger from "../services/logger";

const logger = new Logger().getInstance();
const router = Router();

router.get("/search", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    if (Object.keys(req.query).length == 0) return res.status(400).json({ success: false, message: "Aucun critère de recherche !"});
    logger.log("debug", "Query params: " + JSON.stringify(req.query));

    let userQuery = await Query.findOne({ user: req.user._id, params: req.query });
    let cached = userQuery != null;
    if (!userQuery) {
        logger.log("debug", "Creating new query");
        userQuery = await Query.newQuery(req.user, req.query);
    }
    if (userQuery == null) return res.status(404).json({ success: false, message: "Aucune coordonées trouvée pour ces critères !"});
    logger.log("debug", userQuery.results.length + " logement trouvés !");

    userQuery = await userQuery.populate("user", "-password");
    userQuery = await userQuery.populate("results.dep");
    res.json({success: true, data: { query: userQuery, cached }});
})

export default router;