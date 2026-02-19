import { setUser } from "src/config";
import { createUser, getUser, getUsers, resetUsers, getUsersById } from "../lib/db/queries/users.js";
import { readConfig } from "../config.js";
import { fetchFeed } from "src/lib/rss.js";
import { createFeed, getFeeds } from "src/lib/db/queries/feeds.js";
import { Feed, User } from "src/lib/db/schema.js";

export type CommandRegistry = Record<string, CommandHandler>;

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

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
}

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