import { setUser, readConfig } from "./config.js";
import { CommandRegistry, 
         registerCommand, 
         handlerLogin, 
         handlerRegister, 
         handlerReset,
         handlerGetUsers,
         handlerAgg,
         handlerAddFeed,
         handlerGetFeeds,
         runCommand, 
         handlerFollow,
         handlerListFeedFollows,
        handlerUnfollow} from "./commands/commandHandler.js";

import { argv, exit } from "process";
import { register } from "module";
import { middlewareLogin } from "./middleware.js";

async function main() {
    const registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", handlerAddFeed);
    registerCommand(registry, "feeds", handlerGetFeeds);
    registerCommand(registry, "follow", middlewareLogin(handlerFollow));
    registerCommand(registry, "following", middlewareLogin(handlerListFeedFollows));
    registerCommand(registry, "unfollow", middlewareLogin(handlerUnfollow));

    const args = argv.slice(2);
    if (args.length === 0) {
        console.log("Not enough arguments");
        exit(1);
    };

    const command = args[0];
    const cmdArgs = args.slice(1);
    await runCommand(registry, command, ...cmdArgs);
    process.exit(0);
}

main();