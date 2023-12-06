import { getSecrets, checkRefresh } from '../../src/services/auth';
import jwt from "jsonwebtoken";
import {describe} from "node:test";

describe("Auth server", () => {

    describe("Get secrets", () => {
        it("should throw if no secrets", () => {
            delete process.env.ACCESS_SECRET;
            delete process.env.REFRESH_SECRET;

            expect(() => getSecrets()).toThrow();
        });

        it("should throw if one is missing", () => {
            delete process.env.ACCESS_SECRET;

            expect(() => getSecrets()).toThrow();

            process.env.ACCESS_SECRET = "secret";
            delete process.env.REFRESH_SECRET;

            expect(() => getSecrets()).toThrow();
        });

        it("should get secrets", () => {
            process.env.ACCESS_SECRET = "secret";
            process.env.REFRESH_SECRET = "secret";

            const secrets = getSecrets();
            expect(secrets).toHaveProperty("accessSecret", process.env.ACCESS_SECRET);
            expect(secrets).toHaveProperty("refreshSecret", process.env.REFRESH_SECRET);
        });
    });

    describe("Check refresh", () => {
        beforeEach(() => {
            process.env.ACCESS_SECRET = "secret";
            process.env.REFRESH_SECRET = "secret";
        });

        it("should return success false if no token", () => {
           const res = checkRefresh("");
           expect(res).toHaveProperty("success", false);
        });

        it("should return success false if invalid token", () => {
            const token = jwt.sign({ bidon: "null"}, "secret bidon", { expiresIn: "1h" });
            const res = checkRefresh(token);
            expect(res).toHaveProperty("success", false);
        });

        it("should return success false if expired token", () => {
            const token = jwt.sign({}, getSecrets().accessSecret, { expiresIn: "0s" });
            const res = checkRefresh(token);
            expect(res).toHaveProperty("success", false);
        });

        it("should return success true if valid token", () => {
            const payload = { user: "un user" };
            const token = jwt.sign(payload, getSecrets().accessSecret, { expiresIn: "1h" });
            const res = checkRefresh(token);
            expect(res).toHaveProperty("success", true);
            expect(res).toHaveProperty("payload");
            expect(res.payload).toHaveProperty("user", payload.user);
        });
    });
});