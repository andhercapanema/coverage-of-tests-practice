import { faker } from "@faker-js/faker";
import prisma from "config/database";

export async function createGame(consoleId: number) {
    return await prisma.game.create({
        data: {
            title: faker.word.noun(),
            consoleId,
        },
    });
}

export async function getGameWithInfo(id: number) {
    return await prisma.game.findUnique({
        where: {
            id,
        },
        include: {
            Console: true,
        },
    });
}
