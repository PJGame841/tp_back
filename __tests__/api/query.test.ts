import request from "supertest";
import {Express} from "express";
import {Server} from "http";
import {User, UserDocument} from "../../src/models/user";
import {Query} from "../../src/models/queries";
import tcpPortUsed from "tcp-port-used";
import {isConnected} from "../../src/loaders/db";
import {Types} from "mongoose";


describe("Query Controller", () => {
    let app: Express;
    let server: Server;

    let user: UserDocument;
    let authToken: string;

    beforeAll(async () => {
        let port = 3002;
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

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "pj@pj.fr", password: "pj123" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("tokens");
        expect(res.body.data.tokens).toHaveProperty("accessToken");

        authToken = res.body.data.tokens.accessToken;
    }, 30000);

    afterAll(() => {
        server.close();
    });

    describe("GET /api/v1/queries/", () => {
        it("should return 401 if no token passed", async () => {
            const res = await request(app)
                .get("/api/v1/queries")
                .send();

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 200 with offset 0", async () => {
            const res = await request(app)
                .get("/api/v1/queries")
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("queries");
            expect(res.body.data).toHaveProperty("limit", 10);
            expect(res.body.data).toHaveProperty("offset", 0);
            expect(res.body.data).toHaveProperty("length", 0);
        });

        it("should return 200 with offset 1", async () => {
            const res = await request(app)
                .get("/api/v1/queries")
                .set("Authorization", `Bearer ${authToken}`)
                .query({ offset: 1 })
                .send();

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("queries");
            expect(res.body.data).toHaveProperty("limit", 10);
            expect(res.body.data).toHaveProperty("offset", 1);
            expect(res.body.data).toHaveProperty("length", 0);
        });

        it("should return 200 with all user queries", async () => {
            const queries = [
                {
                    user: user._id,
                    params: {},
                    results: []
                },{
                    user: user._id,
                    params: {},
                    results: []
                },{
                    user: user._id,
                    params: {},
                    results: []
                },{
                    user: user._id,
                    params: {},
                    results: []
                }
            ]
            await Query.insertMany(queries);

            const res = await request(app)
                .get("/api/v1/queries")
                .set("Authorization", `Bearer ${authToken}`)
                .query({ offset: 0 })
                .send();

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("queries");
            expect(res.body.data).toHaveProperty("limit", 10);
            expect(res.body.data).toHaveProperty("offset", 0);
            expect(res.body.data).toHaveProperty("length", queries.length);
            expect(res.body.data.queries.length).toBe(queries.length);
        });
    });

    describe("DELETE /api/v1/queries/:queryId", () => {
       it("should return 401 if no token", async () => {
            const res = await request(app)
                .delete("/api/v1/queries/123")
                .send();

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
       });

        it("should return 404 if no queryId", async () => {
            const res = await request(app)
                .delete("/api/v1/queries/")
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(404);
        });

        it("should return 400 if queryId invalid", async () => {
            const res = await request(app)
                .delete("/api/v1/queries/123")
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 if queryId not found", async () => {
            const res = await request(app)
                .delete("/api/v1/queries/" + new Types.ObjectId())
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return 200 if queryId found", async () => {
            const query = new Query({
                user: user._id,
                params: {},
                results: []
            });
            await query.save();

            const res = await request(app)
                .delete("/api/v1/queries/" + query._id)
                .set("Authorization", `Bearer ${authToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("query");
            expect(res.body.data.query).toHaveProperty("_id", query._id.toString());

            const deletedQuery = await Query.findById(query._id);
            expect(deletedQuery).toBeNull();
        });
    });
})