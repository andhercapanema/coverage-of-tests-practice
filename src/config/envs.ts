import dotenv from "dotenv";

export function loadEnvs() {
    const path = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

    dotenv.config({ path });
}
