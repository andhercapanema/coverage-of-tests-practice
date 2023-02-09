import supertest from "supertest";
import app from "../../src/app";
import { cleanDb } from "../helpers";
import httpStatus from "http-status";
import { faker } from "@faker-js/faker";
import { createConsole, createGame, getGameWithInfo } from "../factories";
import prisma from "config/database";

const server = supertest(app);

beforeEach(async () => {
    await cleanDb();
});

describe("POST /games", () => {
    it("should respond with status 422 when body is not present", async () => {
        const response = await server.post("/games");

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    it("should respond with status 422 when body is not valid", async () => {
        const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

        const response = await server.post("/games").send(invalidBody);

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    describe("when body is valid", () => {
        it("should respond with status 409 when game already exists", async () => {
            const createdConsole = await createConsole();
            const { title, consoleId } = await createGame(createdConsole.id);

            const response = await server
                .post("/games")
                .send({ title, consoleId });

            expect(response.status).toEqual(httpStatus.CONFLICT);
        });

        it("should respond with status 409 when console does not exist", async () => {
            const response = await server.post("/games").send({
                title: faker.word.noun(),
                consoleId: faker.datatype.number(),
            });

            expect(response.status).toEqual(httpStatus.CONFLICT);
        });

        it("should respond with status 201 and create game entry", async () => {
            const createdConsole = await createConsole();

            const validBody = {
                title: faker.word.noun(),
                consoleId: createdConsole.id,
            };

            const response = await server.post("/games").send(validBody);

            expect(response.status).toEqual(httpStatus.CREATED);

            const createdGame = await prisma.game.findFirst();

            expect(createdGame).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    title: validBody.title,
                    consoleId: validBody.consoleId,
                })
            );
        });
    });
});

describe("GET /games", () => {
    it("should respond with status 200 and return games", async () => {
        const createdConsole = await createConsole();
        const game = await createGame(createdConsole.id);

        const response = await server.get("/games");

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body.length).toBe(1);

        const completeGame = await getGameWithInfo(game.id);

        expect(response.body).toEqual(expect.arrayContaining([completeGame]));
    });
});

describe("GET /consoles/:id", () => {
    it("should respond with status 404 for invalid game id", async () => {
        const createdConsole = await createConsole();
        const game = await createGame(createdConsole.id);

        const response = await server.get(`/games/${game.id + 1}`);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and return console", async () => {
        const createdConsole = await createConsole();
        const game = await createGame(createdConsole.id);

        const response = await server.get(`/games/${game.id}`);

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(game);
    });
});
