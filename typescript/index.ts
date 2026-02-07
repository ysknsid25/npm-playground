import { defineCommand, runMain } from "citty";

const greet = defineCommand({
    meta: {
        name: "greet",
        description: "Greet someone",
    },
    args: {
        name: {
            type: "positional",
            description: "Your name",
            required: true,
        },
        friendly: {
            type: "boolean",
            description: "Use friendly greeting",
        },
    },
    run({ args }) {
        console.log(`${args.friendly ? "Hi" : "Greetings"} ${args.name}!`);
    },
});

const byebye = defineCommand({
    meta: {
        name: "byebye",
        description: "Goodbye someone",
    },
    args: {
        name: {
            type: "positional",
            description: "Your name",
            required: true,
        },
    },
    run({ args }) {
        console.log(`byebye👋 ${args.name}!`);
    },
    setup({ args }) {
        console.log(`now setup ${args.name}`);
    },
    cleanup({ args }) {
        console.log(`now cleanup ${args.name}`);
    },
});

const main = defineCommand({
    meta: {
        name: "hello",
        version: "1.0.0",
        description: "My Awesome CLI App",
    },
    subCommands: {
        greet,
        byebye,
    },
});

runMain(main);
