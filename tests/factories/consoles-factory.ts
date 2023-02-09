import { faker } from "@faker-js/faker";
import prisma from "config/database";

export async function createConsole() {
    return await prisma.console.create({
        data: {
            name: faker.word.noun(),
        },
    });
}
