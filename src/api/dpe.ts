import {Router} from "express";
import {AuthenticatedRequest, isAuthenticated} from "~/api/middlewares/auth";
import {Dpe} from "~/models/dpe";

const router = Router();

router.get("/search", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const { etiquette_ges, etiquette_dpe, code_postal } = req.query;
    if (!etiquette_ges) return res.status(400).json({ success: false, message: "Veuillez fournir une étiquette GES" });
    if (!etiquette_dpe) return res.status(400).json({ success: false, message: "Veuillez fournir une étiquette DPE" });
    if (!code_postal) return res.status(400).json({ success: false, message: "Veuillez fournir un code postal" });

    const dpe = await Dpe.findOne({etiquette_ges, etiquette_dpe, code_postal});
    if (!dpe) return res.status(404).json({ success: false, message: "Aucun DPE trouvé pour ces critères !" });

    res.json({success: true, data: { dpe, ...dpe.searchNominatim() }});
})

export default router;