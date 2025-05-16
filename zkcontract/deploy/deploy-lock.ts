import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();

  await deployContract("Lock", [10425235019], {
    hre,
    wallet,
    verify: true,
  });
}
