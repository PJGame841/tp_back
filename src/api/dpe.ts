import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "~/api/middlewares/auth";
import {Query} from "~/models/queries";
import Logger from "~/services/logger";

const logger = new Logger().getInstance();
const router = Router();

router.get("/search", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    let userQuery = await Query.findOne({ user: req.user._id, params: req.query });
    let cached = userQuery != null;
    if (!userQuery) {
        userQuery = await Query.newQuery(req.user, req.query);
    }
    if (userQuery == null) return res.status(404).json({ success: false, message: "Aucune coordonées trouvée pour ces critères !"});
    logger.log("debug", userQuery.results.length + " logement trouvés !");

    userQuery = await userQuery.populate("user", "-password");
    userQuery = await userQuery.populate("results.dep");
    res.json({success: true, data: { query: userQuery, cached }});
})

router.delete('/:queryId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    const { queryId } = req.params;
    if (!queryId) return res.status(404).json({ success: false, message: "Veuillez fournir un ID de DEP !" });

    const query = await Query.findByIdAndDelete(queryId).populate("user", "-password").populate("results.dep");
    if (query == null) return res.status(404).json({ success: false, message: "Requête non trouvé pour l'id de DEP fourni: " + req.params.id });

    res.json({ success: true, data: { query } });
});

export default router;