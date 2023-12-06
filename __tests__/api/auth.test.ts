import request from "supertest";
import {Express} from "express";
import tcpPortUsed from "tcp-port-used";
import {Server} from "http";
import {isConnected} from "../../src/loaders/db";
import {User, UserDocument} from "../../src/models/user";
import jwt from "jsonwebtoken";

describe("Auth", () => {
    let app: Express;
    let server: Server;

    let user: UserDocument;

    beforeAll(async () => {
        let port = 3000;
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

    describe("POST /api/v1/auth/login", () => {
        it("should return 401 if no body passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send();
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body).toHaveProperty("message");
        });

        it("should return 401 if no password passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "test"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body).toHaveProperty("message");
        });

        it("should return 401 if no email passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    password: "test"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body).toHaveProperty("message");
        });

        it("should return 401 if user not exists", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "test",
                    password: "ahhhhh"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body).toHaveProperty("message");
        });

        it("should return 401 if password invalid", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "pj@pj.fr",
                    password: "invalid_password"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body).toHaveProperty("message");
        });

        it("should return 200", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "pj@pj.fr",
                    password: "pj123"
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("user");
            expect(res.body.data).toHaveProperty("tokens");
        });
    });

    describe("GET /api/v1/auth/me", () => {
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

        it("should return 401",async () => {
            const res = await request(app).get("/api/v1/auth/me");
            expect(res.status).toBe(401);
        });

        it("should return 200",async () => {

            const res = await request(app)
                .get("/api/v1/auth/me")
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("email", "pj@pj.fr");
        })
    });

    describe("POST /api/v1/auth/register", () => {
        it("should return 400 if no body passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send();

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if no username passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "test",
                    password: "test"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if no email passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "test",
                    password: "test"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if no password passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "test",
                    email: "test"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 200", async () => {
            const res = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "test",
                    email: "test",
                    password: "test"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("user");
            expect(res.body.data.user.username).toBe("test");
            expect(res.body.data.user.email).toBe("test");
            expect(res.body.data).toHaveProperty("tokens");

            const newUser = await User.findOne({ email: "test" });
            expect(newUser).not.toBeNull();
        })
    });

    describe("POST /api/v1/auth/refresh", () => {
        let refreshToken: string;
        beforeEach(async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "pj@pj.fr", password: "pj123" });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("tokens");
            expect(res.body.data.tokens).toHaveProperty("refreshToken");

            refreshToken = res.body.data.tokens.refreshToken;
        });

        it("should return 401 if no body passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send();

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 if no refreshToken passed", async () => {
            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    email: "test",
                    password: "test"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 if refreshToken invalid", async () => {
            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    refreshToken: "invalid"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 if user not exists", async () => {
            const token = jwt.sign({ email: "testbidon" }, process.env.REFRESH_SECRET!);

            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    refreshToken: token
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return 200", async () => {
            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({
                    refreshToken
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("tokens");
            expect(res.body.data.tokens).toHaveProperty("accessToken");
        });
    })
});