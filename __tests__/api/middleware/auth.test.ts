import { isAuthenticated } from "../../../src/api/middlewares/auth";
import { User } from "../../../src/models/user";
import jwt from "jsonwebtoken";

describe("Auth middleware", () => {
    describe("isAuthenticated", () => {
        beforeEach(() => {
            process.env.ACCESS_SECRET="secret";
            process.env.REFRESH_SECRET="secret";
        });

        it("should return 401 if no token", () => {
            const req = {
                get: jest.fn().mockReturnValue(null)
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };
            const next = jest.fn();

            isAuthenticated(req as any, res as any, next);

            expect(req.get.mock.calls).toHaveLength(1);
            expect(req.get.mock.calls[0][0]).toBe("Authorization");

            expect(res.status.mock.calls[0][0]).toBe(401);

            expect(res.json.mock.calls).toHaveLength(1);
            expect(res.json.mock.calls[0][0]).toHaveProperty("success", false);
            expect(res.json.mock.calls[0][0]).toHaveProperty("message");

            expect(next.mock.calls).toHaveLength(0);
        });

        it("should return 401 if invalid token", () => {
            const req = {
                get: jest.fn().mockReturnValue("Bearer token")
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };
            const next = jest.fn();

            isAuthenticated(req as any, res as any, next);

            expect(req.get.mock.calls).toHaveLength(1);
            expect(req.get.mock.calls[0][0]).toBe("Authorization");

            expect(res.status.mock.calls[0][0]).toBe(401);

            expect(res.json.mock.calls).toHaveLength(1);
            expect(res.json.mock.calls[0][0]).toHaveProperty("success", false);
            expect(res.json.mock.calls[0][0]).toHaveProperty("message");

            expect(next.mock.calls).toHaveLength(0);
        });

        it("should return 404 if user doesnt exists", async () => {
            const token = jwt.sign({ email: "pj" }, process.env.ACCESS_SECRET!, { expiresIn: "1h" })
            const req = {
                user: undefined,
                get: jest.fn().mockReturnValue("Bearer " + token)
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };
            const next = jest.fn();

            const findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue(null)
            });
            User.findOne = findOne;

            await isAuthenticated(req as any, res as any, next);

            expect(req.get.mock.calls).toHaveLength(1);
            expect(req.get.mock.calls[0][0]).toBe("Authorization");

            expect(findOne.mock.calls).toHaveLength(1);
            expect(findOne.mock.calls[0][0]).toHaveProperty("email", "pj");
            expect(findOne.mock.results[0].value).toHaveProperty("select");
            expect(findOne.mock.results[0].value.select.mock.calls).toHaveLength(1);
            expect(findOne.mock.results[0].value.select.mock.calls[0][0]).toBe("-password");
            expect(findOne.mock.results[0].value.select.mock.results).toHaveLength(1);
            expect(findOne.mock.results[0].value.select.mock.results[0].value).toBeNull();

            expect(next.mock.calls).toHaveLength(0);
            expect(req.user).toBeUndefined();

            expect(res.status.mock.calls).toHaveLength(1);
            expect(res.status.mock.calls[0][0]).toBe(404);

            expect(res.json.mock.calls).toHaveLength(1);
            expect(res.json.mock.calls[0][0]).toHaveProperty("success", false);
            expect(res.json.mock.calls[0][0]).toHaveProperty("message");
        });
    });
});