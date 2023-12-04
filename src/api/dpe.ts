import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "~/api/middlewares/auth";
import {Dpe} from "~/models/dpe";
import {Query} from "~/models/queries";

const router = Router();

router.get("/search", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    const { etiquette_ges, etiquette_dpe, code_postal } = req.query;
    if (!etiquette_ges) return res.status(400).json({ success: false, message: "Veuillez fournir une étiquette GES" });
    if (!etiquette_dpe) return res.status(400).json({ success: false, message: "Veuillez fournir une étiquette DPE" });
    if (!code_postal) return res.status(400).json({ success: false, message: "Veuillez fournir un code postal" });

    const dep = await Dpe.findOne({"Code_postal_(BAN)": code_postal});
    if (dep == null) return res.status(404).json({ success: false, message: "Aucun DEP trouvé pour ces critères !" });

    let userQuery = await Query.findOne({ user: req.user._id, dep: dep._id });
    let cached = userQuery != null;
    if (!userQuery) {
        userQuery = await Query.newQuery(req.user, dep);
    }
    if (userQuery == null) return res.status(404).json({ success: false, message: "Aucune coordonées trouvée pour ces critères !"});

    userQuery = await userQuery.populate("user", "-password");
    userQuery = await userQuery.populate("dep");
    res.json({success: true, data: { query: userQuery, cached }});
})

router.delete('/:depId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    const { depId } = req.params;
    if (!depId) return res.status(404).json({ success: false, message: "Veuillez fournir un ID de DEP !" });

    const query = await Query.findOneAndDelete({ user: req.user._id, dep: depId }).populate("user", "-password").populate("dep");
    if (query == null) return res.status(404).json({ success: false, message: "Requête non trouvé pour l'id de DEP fourni: " + req.params.id });

    res.json({ success: true, data: { query } });
});

export default router;