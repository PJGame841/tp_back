import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "~/api/middlewares/auth";
import {Query} from "~/models/queries";


const router = Router();

router.get("/", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    const limit = 10;
    let { offset: offsetParam } = req.query as {[key: string]: string};

    let offset = parseInt(offsetParam);
    if (isNaN(offset)) offset = 0;

    const queries = await Query.find({ user: req.user._id })
        .populate("user", "-password")
        .populate("results.dep")
        .sort({ createdAt: -1 })
        .skip(offset * limit);

    res.json({ success: true, data: { queries, limit, length: queries.length, offset } });
});

router.delete('/:queryId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Utilisateur non connecté !" });

    const { queryId } = req.params;
    if (!queryId) return res.status(404).json({ success: false, message: "Veuillez fournir un ID de DEP !" });

    const query = await Query.findByIdAndDelete(queryId).populate("user", "-password").populate("results.dep");
    if (query == null) return res.status(404).json({ success: false, message: "Requête non trouvé pour l'id de DEP fourni: " + req.params.id });

    res.json({ success: true, data: { query } });
});

export default router;