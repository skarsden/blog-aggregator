import { db } from "..";
import { feeds } from "../schema";
import { firstOrUndefined } from "./utils";
import { eq } from "drizzle-orm";

export async function createFeed(
    feedName: string,
    url: string,
    userId: string,
) {
    const result = await db.insert(feeds).values({
        name: feedName, url, userId}).returning();

    return firstOrUndefined(result);
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function resetFeed() {
    await db.delete(feeds);
    console.log("Deleted successfully");
}

export async function getFeedByURL(url: string) {
    const result = await db.select().from(feeds).where(eq(feeds.url, url));
    return firstOrUndefined(result);
}