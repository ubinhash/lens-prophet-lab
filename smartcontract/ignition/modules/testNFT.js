// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("TestNFT", (m) => {

  const zsp = m.contract("TestNFT");
  m.call(zsp,"ownerMint",["0xb25998F4d7055d811544fA6F97DC626d171DBa37",100],{id:"c"})
  m.call(zsp,"setBaseURI",["https://storage.googleapis.com/fu-public-asset/json_v3/"],{ id: "e"})

  return { zsp };
});
