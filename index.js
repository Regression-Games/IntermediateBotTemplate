const RGBot = require("rg-bot").RGBot;

/**
 * This strategy is an intermediate example of how to craft and equip items, and harvest blocks with the rg-bot package.
 * The Bot will create a pickaxe and use it to mine the bell in the starting village
 *
 * @param {RGBot} bot
 */
function configureBot(bot) {

    bot.setDebug(true);

    // This is our main loop. The Bot will invoke this on spawn.
    // goal: Gather wood, use it to craft a pickaxe, and then dig the Bell in the starting village.
    async function startRoutine() {

        // Two of the houses in the starting village have a chest containing logs as well as a crafting table.
        // These are the perfect places to quickly craft a pickaxe, which will allow the Bot to collect the village's Bell.
        // First, find and approach the nearest crafting table
        let craftingTable = await bot.findBlock('crafting_table');
        if (craftingTable) {
            const pathingSuccessful = await bot.approachBlock(craftingTable, {reach: 3});
            if(!pathingSuccessful) {
                // Sometimes the Bot may encounter pathing issues. Since there are two houses with the perfect
                // conditions for this strategy, the Bot can try to get to the second house if it fails to approach the first one.
                craftingTable = await bot.findBlock('crafting_table', { skipClosest: true });
                if (craftingTable) {
                    await bot.approachBlock(craftingTable, {reach: 3});
                }
            }
        
            // Next, loot some logs from the chest in the same house.
            // The chest has three, but the Bot only needs two to craft the pickaxe,
            // so we won't let it be too greedy.
            const chest = bot.findBlock('chest', { maxDistance: 30 });
            if (chest) {
                if (await bot.approachBlock(chest)) {
                    const chestInventoryWindow = await bot.openContainer(chest);
                    if (chestInventoryWindow) {
                        try {
                            await bot.withdrawItems(chestInventoryWindow, { itemName: 'spruce_log', quantity: 2 });
                        } finally {
                            await bot.closeContainer(chestInventoryWindow);
                        }
                    }
                }
            }
            
            if (craftingTable) {
                if (await bot.approachBlock(craftingTable), {reach: 3}) {
                    // Craft the components the Bot will need for one pickaxe
                    // Turn the logs into 8 planks, and then two of the planks into some sticks
                    await bot.craftItem('spruce_planks', { quantity: 2 });
                    await bot.craftItem('stick');

                    // Now the Bot has enough materials to craft a pickaxe
                    await bot.approachBlock(craftingTable);
                    await bot.craftItem('wooden_pickaxe', { craftingTable: craftingTable });
                    await bot.holdItem('wooden_pickaxe');
                }
            }
        }

        // Finally, have the Bot collect the Bell using its new pickaxe
        await bot.findAndDigBlock('bell', { maxDistance: 100 });
        bot.chat(`I have collected the village's Bell!`);
    }

    // When spawned, start main function
    bot.on('spawn', async () => {
        bot.chat('Hello! I have arrived!');
        startRoutine();
    });

}

exports.configureBot = configureBot;
