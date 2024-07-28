import { promises as fs } from 'fs'; // Use fs.promises for async file operations
import { connectSdk } from "./utils/connect-sdk.js";

const play = async () => {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("run this command: node ./src/4-play.js {collectionId-cars} {tokenId} {nickname}");
    process.exit(1);
  }

  const [carsCollectionId, tokenId, nickname] = args;
  const { account, sdk } = await connectSdk();

  let { nonce } = await sdk.common.getNonce(account);
  const transactions = [];

  // Read the player's current token attributes from the file
  const statsFile = 'stats.json';

  try {
    const data = await fs.readFile(statsFile, 'utf8');
    const playerAttributes = JSON.parse(data);

    // Log the current player attributes
    console.log("Player attributes:", playerAttributes);

    // Update the player's traits
    const newAttributes = {
      "Victories": playerAttributes.Victories + 1,
      "Defeats": playerAttributes.Defeats,
      "Total time played": playerAttributes.total_time_played, // Example increment, adjust as needed
      "Best lap time": playerAttributes.best_lap_time // Example, update with actual lap time
    };

    // Log the new player attributes
    console.log("New player attributes:", newAttributes);

    // Prepare the properties update transaction
    transactions.push(sdk.token.setProperties({
      collectionId: carsCollectionId,
      tokenId: tokenId,
      properties: [{
        key: "tokenData",
        value: JSON.stringify({
          ...playerAttributes,
          ...newAttributes,
          "Nickname": nickname // Ensure nickname is not updated
        })
      }]
    }, { nonce: nonce++ }));

    await Promise.all(transactions);

  }
}
