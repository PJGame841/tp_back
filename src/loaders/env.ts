import dotenv from "dotenv";

dotenv.config({
    path: process.env.NODE_ENV == "test" ? ".env.test" : ".env"
});

const envVariables = [
    { name: "ACCESS_SECRET", required: true, type: "string" },
    { name: "REFRESH_SECRET", required: true, type: "string" },
    { name: "SALT_ROUND", required: true, type: "string" },
    { name: "MONGO_URL", required: false, type: "string" },
    { name: "USE_UNIV_PROXY", require: false, type: "string" }
]

export default () => {
    for (const envVar of envVariables) {
        if (!process.env[envVar.name]) {
            if (envVar.required) {
                throw new Error("La variable d'environnement " + envVar.name + " est requise")
            } else {
                console.log("ATTENTION ! " + envVar.name + " n'est pas définie");
            }
        } else if (typeof process.env[envVar.name] != envVar.type) {
            throw new Error("La variable d'environnement " + envVar.name + " n'est pas du bon type !");
        }
    }
}