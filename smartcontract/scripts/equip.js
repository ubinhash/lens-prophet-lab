const { ethers } = require("hardhat");

async function main() {
    // const contractAddress = "0x3587E4AAF6c4116d100bdEF252156F33B1E6b091"; // Replace with your contract address
    // const gameContractAddress="0x4B0704e059fbe554e96C1074F5aeF6BEFe64F503"
    // const mazeContractAddress="0xb3E98A10224E2fbe460C270E82102AbF68bB38b1"


    // MAINNET
    const contractAddress = "0xC1D7D6f436dF7dDF738201F42c59F14b67602cD0"; // Replace with your contract address
    const gameContractAddress="0x0467e39Be6565907EC903A5e59073053aD075B3A"
    const mazeContractAddress="0xd82665A08F5B3639A8Ba586988aCd72b194c5CEa"

    const [owner] = await ethers.getSigners(); // Ensure this is the contract owner

    // Get the contract instance
    const contract = await ethers.getContractAt("GameEquip", contractAddress, owner);
    const gameContract = await ethers.getContractAt("Game", gameContractAddress, owner);
    const mazeContract = await ethers.getContractAt("Maze", mazeContractAddress, owner);

    console.log("setOperator");
    let tx = await gameContract.setOperator(contractAddress, true);
    await tx.wait();
    console.log("operator set!");


    // console.log("setGameEquip");
    // tx = await mazeContract.setGameEquipContract(contractAddress);
    // await tx.wait();
    // console.log("Game Equip set!");


    // EQUIP KEYS
    const playerIdsKeys = [13, 16, 18, 19, 14, 1, 25, 15, 28, 23, 30,44];
    const keysTokenIds = [111, 21, 1016, 22, 177, 30, 1047, 178, 1015, 39, 1000,26];

    console.log("Equipping keys...");
    tx = await contract.batchEquipKeys(playerIdsKeys, keysTokenIds);
    await tx.wait();
    console.log("Keys equipped!");

    // EQUIP EYES
    const playerIdsEyes = [16, 14, 15, 13, 23];
    const eyesTokenIds = [287, 299, 300, 301, 54];

    console.log("Equipping eyes...");
    tx = await contract.batchEquipEyes(playerIdsEyes, eyesTokenIds);
    await tx.wait();
    console.log("Eyes equipped!");




    
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

