import { db } from "..";
import { feeds, feedFollows, users } from "../schema";
import { eq, and } from "drizzle-orm";

export async function createFeedFollows(userId: string, feedId: string) {
    const [newFeedFollows] = await db.insert(feedFollows).values({ feedId, userId}).returning();

    const [result] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userId: feedFollows.userId,
        feedId: feedFollows.feedId,
        feedName: feeds.name,
        userName: users.name
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(
        and(
            eq(feedFollows.id, newFeedFollows.id),
            eq(users.id, newFeedFollows.userId),
        ),
    );

    return result;
}
export async function getFeedFollowsForUser(userId: string) {
    const result = await db
    .select( {
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userId: feedFollows.userId,
        feedId: feedFollows.feedId,
        feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));

    return result;
}

export async function deleteByUserAndURL(userId: string, feedId: string) {
    await db
    .delete(feedFollows)
    .where(
        and(
            eq(feedFollows.userId, userId),
            eq(feedFollows.feedId, feedId)
        )
    );
}

export async function resetFeedFollow() {
    await db.delete(feedFollows);
    console.log("Deleted successfully");
}