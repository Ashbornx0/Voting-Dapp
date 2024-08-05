require("@nomicfoundation/hardhat-toolbox");
//require("nomiclabs/hardhat-etherscan");
require("dotenv"),config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.2",
  networks: {
    polygon_amoy: { 
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  ethers: {
    apiKey: process.env.API_KEY,
  },
};
