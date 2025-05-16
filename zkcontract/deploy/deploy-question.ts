import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();

  await deployContract("QuestionTemplateManager", [], {
    hre,
    wallet,
    verify: true,
  });
}
