import {Router} from "express";

const router = Router();

router.post('/login', (req, res) => {
    res.json({ message: "Hello World" });
});

router.post('/register', (req, res) => {
    res.send('register');
});

export default router;