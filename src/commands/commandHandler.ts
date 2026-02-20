import { setUser } from "src/config";
import { createUser, getUser, getUsers, resetUsers, getUsersById } from "../lib/db/queries/users.js";
import { readConfig } from "../config.js";
import { fetchFeed } from "src/lib/rss.js";
import { createFeed, getFeeds, getFeedByURL, resetFeed } from "src/lib/db/queries/feeds.js";
import { Feed, User } from "src/lib/db/schema.js";
import { createFeedFollows, deleteByUserAndURL, getFeedFollowsForUser, resetFeedFollow } from "src/lib/db/queries/feedFollows.js";

export type CommandRegistry = Record<string, CommandHandler>;

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandRegistry, cmdName:string, ...args: string[]): Promise<void> {
    if (!registry[cmdName]) {
        throw new Error(`Command ${cmdName} does not exist`);
    }
    await registry[cmdName](cmdName, ...args);
}


//Command definitions----------------------------------------------------------
export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }
    const name = args[0];
    const user = await createUser(name);
    if (!user) {
        throw new Error(`User ${name} not found`);
    }

    setUser(user.name);
    console.log(`User ${user.name} created successfully`);
}

export async function handlerReset() {
    await resetUsers();
    await resetFeed();
    await resetFeedFollow();
}

//User Commands--------------------------------------------------------------
export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }
    
    const name = args[0];
    const existingUser = await getUser(name);
    if (!existingUser) {
        throw new Error(`User ${name} not found`);
    }
    setUser(existingUser.name);
    console.log(`User '${name} has been set`);
};


export async function handlerGetUsers() {
    const config = readConfig();
    const users = await getUsers();
    for (const u of users) {
        if (u.name === config.currentUserName) {
            console.log(`* ${u.name} (current)`);
            continue;
        }
        console.log(`* ${u.name}`);
    }
}

export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void> | void;

//Feed commands---------------------------------------------------------------
export async function handlerAgg(_: string) {
    const feedURL = "https://www.wagslane.dev/index.xml";

    const feedData = await fetchFeed(feedURL);
    const feedDataStr = JSON.stringify(feedData, null, 2);
    console.log(feedDataStr);
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <feed_name> <url>`);
    }

    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if(!user) {
        throw new Error(`User ${config.currentUserName} not found`);
    }

    const feedName = args[0];
    const url = args[1];

    const feed = await createFeed(feedName, url, user.id);
    if (!feed) {
        throw new Error("Failed to create feed");
    }

    const feedFollow = await createFeedFollows(user.id, feed.id);
    printFeedFollows(user.name, feed.name);

    console.log("Feed created successfully:");
    printFeed(feed, user);
}

export async function handlerGetFeeds() {
    const feeds = await getFeeds();
    for (const f of feeds) {
        const users = await getUsersById(f.userId);
        console.log(`* ${f.name}\n  ${f.url}`);
        for (const u of users) {
            console.log(`  ${u.name}`);
        }
    }
}

function printFeed(feed: Feed, user: User) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
}

//FeedFollows Commands-----------------------------------------------------
export async function handlerFollow(cmdName: string, user: User,  ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <feed_url>`);
    }

    const feedURL = args[0];
    const feed = await getFeedByURL(feedURL);
    if (!feed) {
        throw new Error(`Feed ${feedURL} not found`);
    }

    const ffRow = await createFeedFollows(user.id, feed.id);

    console.log(`Feed follow created:`);
    printFeedFollows(ffRow.userName, ffRow.feedName)
}

export async function handlerListFeedFollows(_: string, user: User) {
    const feedFollows = await getFeedFollowsForUser(user.id);
    if (feedFollows.length === 0) {
        console.log("No feed follows for this user");
        return;
    }

    console.log(`Feed follows for user ${user.name}:`);
    for (let ff of feedFollows) {
        console.log(`* ${ff.feedName}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <feed_url>`);
    }

    const url = args[0];
    const feed = await getFeedByURL(url);
    if (!feed) {
        throw new Error(`Feed ${url} not found`);
    }

    await deleteByUserAndURL(user.id, feed.id);
    console.log(`${user.name} unfollowed ${feed.name}`);
}

function printFeedFollows(username: string, feedname: string) {
    console.log(`* User:         ${username}`);
    console.log(`* Feed:         ${feedname}`);
}