import { changeAttribute } from "./utils/change-attribute.js";
import { connectSdk } from "./utils/connect-sdk.js";
import { Address } from "@unique-nft/sdk/utils";

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

  // Get the player's current token attributes
  const playerToken = await sdk.token.getV2({ collectionId: carsCollectionId, tokenId: tokenId });
  const playerAttributes = playerToken.attributes.reduce((acc, attribute) => {
    acc[attribute.trait_type] = attribute.value;
    return acc;
  }, {});

  // Update the player's traits
  const newAttributes = {
    "Victories": playerAttributes.Victories + 1,
    "Defeats": playerAttributes.Defeats,
    "Total time played": playerAttributes["Total time played"] + 80, // Example increment, adjust as needed
    "Best lap time": Math.min(playerAttributes["Best lap time"], 80) // Example, update with actual lap time
  };

  // Prepare the properties update transaction
  transactions.push(sdk.token.setProperties({
    collectionId: carsCollectionId,
    tokenId: tokenId,
    properties: [{
      key: "tokenData",
      value: JSON.stringify({
        ...playerAttributes,
        ...newAttributes,
        "Nickname": playerAttributes.Nickname // Ensure nickname is not updated
      })
    }]
  }, { nonce: nonce++ }));

  await Promise.all(transactions);

  console.log(`TokenID ${tokenId} has ${newAttributes.Victories} wins`);
  console.log(`TokenID ${tokenId} has ${newAttributes.Defeats} defeats`);
  console.log(`TokenID ${tokenId} has ${newAttributes["Total time played"]} total time played`);
  console.log(`TokenID ${tokenId} has ${newAttributes["Best lap time"]} best lap time`);

  console.log(`Player: https://uniquescan.io/opal/tokens/${carsCollectionId}/${tokenId}`);

  process.exit(0);
}

play().catch(e => {
  console.log("Something went wrong during play");
  throw e;
})
