import supertest from "supertest";
import app from "../../src/app";
import { cleanDb } from "../helpers";
import httpStatus from "http-status";
import { faker } from "@faker-js/faker";
import { createConsole } from "../factories";
import prisma from "config/database";

const server = supertest(app);

beforeEach(async () => {
    await cleanDb();
});

describe("POST /consoles", () => {
    it("should respond with status 422 when body is not present", async () => {
        const response = await server.post("/consoles");

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    it("should respond with status 422 when body is not valid", async () => {
        const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

        const response = await server.post("/consoles").send(invalidBody);

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    describe("when body is valid", () => {
        const validBody = {
            name: faker.word.noun(),
        };

        it("should respond with status 409 when console already exists", async () => {
            const createdConsole = await createConsole();

            const response = await server
                .post("/consoles")
                .send({ name: createdConsole.name });

            expect(response.status).toEqual(httpStatus.CONFLICT);
        });

        it("should respond with status 201 and create console entry", async () => {
            const response = await server.post("/consoles").send(validBody);

            expect(response.status).toEqual(httpStatus.CREATED);

            const createdConsole = await prisma.console.findFirst();

            expect(createdConsole.name).toBe(validBody.name);
        });
    });
});

describe("GET /consoles", () => {
    it("should respond with status 200 and return consoles", async () => {
        const createdConsole = await createConsole();

        const response = await server.get("/consoles");

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body.length).toBe(1);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: createdConsole.id,
                    name: createdConsole.name,
                }),
            ])
        );
    });
});

describe("GET /consoles/:id", () => {
    it("should respond with status 404 for invalid console id", async () => {
        const createdConsole = await createConsole();

        const response = await server.get(`/consoles/${createdConsole.id + 1}`);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and return console", async () => {
        const createdConsole = await createConsole();

        const response = await server.get(`/consoles/${createdConsole.id}`);

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: createdConsole.id,
                name: createdConsole.name,
            })
        );
    });
});
