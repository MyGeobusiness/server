const WebSocket = require('ws');

// Replace this with your username
const OWNER_USERNAME = 'YourUsernameHere';

// WebSocket server port (Render sets process.env.PORT)
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Server running on port ${PORT}`);
});

// Maxed-out gear for you
const ownerGear = {
    sword: { type: 'diamond_sword', enchantments: { sharpness: 5, fire_aspect: 2, knockback: 2 } },
    helmet: { type: 'diamond_helmet', enchantments: { protection: 4, unbreaking: 3 } },
    chestplate: { type: 'diamond_chestplate', enchantments: { protection: 4, unbreaking: 3 } },
    leggings: { type: 'diamond_leggings', enchantments: { protection: 4, unbreaking: 3 } },
    boots: { type: 'diamond_boots', enchantments: { protection: 4, unbreaking: 3, feather_falling: 4 } }
};

// Default gear for everyone else
const defaultGear = {
    sword: { type: 'wooden_sword', enchantments: {} },
    helmet: { type: 'leather_helmet', enchantments: {} },
    chestplate: { type: 'leather_chestplate', enchantments: {} },
    leggings: { type: 'leather_leggings', enchantments: {} },
    boots: { type: 'leather_boots', enchantments: {} }
};

// Helper: send inventory
function sendInventory(player, inventory) {
    player.send(JSON.stringify({ type: 'setInventory', inventory }));
}

// Helper: give perks chest if any slot empty
function givePerksIfEmpty(player, inventory) {
    const emptySlots = Object.keys(inventory).filter(slot => !inventory[slot]);
    if (emptySlots.length > 0) {
        emptySlots.forEach(slot => {
            inventory[slot] = { type: 'enchanted_golden_apple', amount: 5 };
        });
        sendInventory(player, inventory);
        console.log(`Perks given to ${player.username} in empty slots`);
    }
}

// Handle new connections
wss.on('connection', (ws) => {
    console.log('New player connected');

    ws.on('message', (msg) => {
        let data;
        try { data = JSON.parse(msg); } 
        catch { return; }

        // Username registration
        if (data.type === 'setUsername') {
            const username = data.username;
            ws.username = username;

            if (username === be_like_jesus) {
                ws.immortal = true;
                sendInventory(ws, ownerGear);
                console.log(`Owner ${username} received maxed gear`);
                givePerksIfEmpty(ws, ownerGear);
            } else {
                ws.immortal = false;
                sendInventory(ws, defaultGear);
                console.log(`Player ${username} received default gear`);
            }
        }

        // Optional: handle requests to check empty slots
        if (data.type === 'checkInventory' && ws.username === OWNER_USERNAME) {
            givePerksIfEmpty(ws, ownerGear);
        }
    });

    // Immortality example: prevent death
    ws.on('damage', (amount) => {
        if (ws.immortal) {
            ws.send(JSON.stringify({ type: 'cancelDamage' }));
        }
    });

    ws.on('close', () => {
        console.log(`${ws.username || 'Unknown'} disconnected`);
    });
});
