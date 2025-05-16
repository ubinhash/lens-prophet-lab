yarn set version berry
///

yarn compile

how to deploy: (code in deploy folder, should verify since verify=true)

yarn deploy --script deploy-token.ts --network lensTestnet

verify

npx hardhat verify  0xD4F565120Cf1bfC5A280Df595b28E5e006abE659 --network lensTestnet
