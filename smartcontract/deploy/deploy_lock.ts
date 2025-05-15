import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";

// require("@nomicfoundation/hardhat-toolbox");
// require ("@matterlabs/hardhat-zksync");

export default async function (hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet.
  const wallet = new Wallet("8e963cc7c45dc206ec6700ee50812e67b744ed7860a5c147417cdec97a817816");

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  const unlockTime= 1893456000;



  // Load contract
  const artifact = await deployer.loadArtifact("Lock");

 
  const greeterContract = await deployer.deploy(artifact, [unlockTime]);

  // Show the contract info.
  console.log(
    `${
      artifact.contractName
    } was deployed to ${await greeterContract.getAddress()}`
  );
}