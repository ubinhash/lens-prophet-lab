import "@matterlabs/hardhat-zksync";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
  },
  zksolc: {
    version: "latest",
    settings: {},
  },
  networks: {
    lensTestnet: {
      chainId: 37111,
      ethNetwork: "sepolia", // or a Sepolia RPC endpoint from Infura/Alchemy/Chainstack etc.
      url: "https://api.staging.lens.zksync.dev",
      verifyURL:
        "https://api-explorer-verify.staging.lens.zksync.dev/contract_verification",
      zksync: true,
    },
    lensMainnet: {
      chainId: 232,
      ethNetwork: "sepolia", // or a Sepolia RPC endpoint from Infura/Alchemy/Chainstack etc.
      url: "https://api.lens.matterhosted.dev/",
      verifyURL:
        "https://api-explorer-verify.lens.matterhosted.dev/contract_verification", //TODO
      zksync: true,
    },
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
};

export default config;

//https://github.com/lens-protocol/lens-v3/blob/development/hardhat.config.ts#L36-L43