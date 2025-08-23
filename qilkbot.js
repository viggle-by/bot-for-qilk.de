const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalXZ } = require("mineflayer-pathfinder").goals;
const mineflayerViewer = require("prismarine-viewer").mineflayer;
const fetch = require("node-fetch");

const options = {
  username: "QilkBot",
  host: "qilk.de",
  version: "1.18.2"
};

const bot = mineflayer.createBot(options);
bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  console.log("QilkBot has joined!");
  mineflayerViewer(bot, { port: 3007, firstPerson: false });
  const mcData = require("minecraft-data")(bot.version);
  bot.pathfinder.setMovements(new Movements(bot, mcData));
});

async function getRgbUsername(username) {
  try {
    const response = await fetch("https://www.birdflop.com/api/v2/rgb?text=" + encodeURIComponent(username));
    const json = await response.json();
    return json.output || username;
  } catch (err) {
    console.error("RGB API request failed:", err);
    return username;
  }
}

bot.on("chat", async (username, message) => {
  if (username === bot.username) return;

  const parts = message.split(" ");
  if (parts[0].toLowerCase() !== "netmsg") return;
  if (parts[1] !== bot.username) return;

  const command = parts.slice(2).join(" ").trim();

  if (command === "colorname") {
    const rgbName = await getRgbUsername(username);
    bot.chat(`netmsg QilkBot ${rgbName}`);
  }

  else if (command === "come") {
    const target = bot.players[username]?.entity;
    if (!target) return bot.chat("I can't see you.");
    bot.chat("Coming to you!");
    bot.pathfinder.setGoal(new GoalXZ(target.position.x, target.position.z));
  }

  else if (command.startsWith("goto")) {
    const [_, x, z] = command.split(" ");
    if (isNaN(x) || isNaN(z)) return bot.chat("Invalid coords.");
    bot.chat(`Going to (${x}, ${z})`);
    bot.pathfinder.setGoal(new GoalXZ(parseInt(x), parseInt(z)));
  }

  else if (command.startsWith("say")) {
    const sayMsg = command.slice(4);
    sayMsg ? bot.chat(sayMsg) : bot.chat("Nothing to say!");
  }

  else {
    bot.chat(`Unknown command: "${command}"`);
  }
});
