import { uuid } from "drizzle-orm/gel-core";
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm"

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUser(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function resetUsers() {
    await db.delete(users);
    console.log("Deleted successfully");
}

export async function getUsersById(id: any){
    const results = await db.select().from(users).where(eq(users.id, id))
    return results;
}

export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}