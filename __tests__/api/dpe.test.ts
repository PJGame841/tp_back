import request from "supertest";
import {Express} from "express";
import {Server} from "http";
import {User, UserDocument} from "../../src/models/user";
import {Query} from "../../src/models/queries";
import tcpPortUsed from "tcp-port-used";
import {isConnected} from "../../src/loaders/db";
import {Dpe} from "../../src/models/dpe";


describe("DPE Controller", () => {
    let app: Express;
    let server: Server;

    let user: UserDocument;

    beforeAll(async () => {
        let port = 3001;
        while (await tcpPortUsed.check(port)) {
            port++;
        }

        process.env["NODE_ENV"] = "test";
        process.env["PORT"] = "" + port;

        const appPackage = await import("../../src/app");
        app = appPackage.default;
        server = appPackage.server;

        // wait for databse to be ready
        while (!isConnected()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        user = new User({
            username: "pj",
            email: "pj@pj.fr",
        });
        await user.hashPassword("pj123");
        await user.save();
    }, 30000);

    afterAll(() => {
        server.close();
    });

    describe("GET /api/v1/logement/search", () => {
        let authToken: string;
        beforeEach(async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "pj@pj.fr", password: "pj123" });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("tokens");
            expect(res.body.data.tokens).toHaveProperty("accessToken");

            authToken = res.body.data.tokens.accessToken;
        });

        it("should return 401 if no token passed", async () => {
            const res = await request(app)
                .get("/api/v1/logement/search")
                .send();

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if no query passed", async () => {
            const res = await request(app)
                .get("/api/v1/logement/search")
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 if no results", async () => {
            const res = await request(app)
                .get("/api/v1/logement/search")
                .set("Authorization", `Bearer ${authToken}`)
                .query({
                    "N°_département_(BAN)": 75
                })
                .send();

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return 200 if result", async () => {
            const params = {
                "Etiquette_GES": "A",
                "Etiquette_DPE": "A",
                "Code_postal_(BAN)": "72380"
            };

            const res = await request(app)
                .get("/api/v1/logement/search")
                .set("Authorization", `Bearer ${authToken}`)
                .query(params)
                .send();

            const dpes = await Dpe.find(params);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("cached", false);
            expect(res.body.data).toHaveProperty("query");
            expect(res.body.data.query).toHaveProperty("user");
            expect(res.body.data.query).toHaveProperty("results");
            expect(res.body.data.query.results.length).toBe(dpes.length);
            expect(res.body.data.query).toHaveProperty("params", params);

            const query = await Query.findOne({ params });
            expect(query).not.toBeNull();
        }, 30000);

    });
})