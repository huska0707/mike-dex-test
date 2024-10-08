const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const PORT = process.env.PORT || 3099;

const { WETH_ADDRESS, RPC_URL } = require("./config/contract");
const { ethers } = require("ethers");
const wethAbi = require("./data/abi/weth.json");

// UncaughtException Error
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(PORT, () => {
  console.log(`Server running`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

app.get("/balance/:addr", async (req, res) => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wethContract = new ethers.Contract(WETH_ADDRESS, wethAbi, provider);

  let userAddr = req.params.addr;
  try {
    userAddr = ethers.utils.getAddress(userAddr);
    const balance = await wethContract.balanceOf(userAddr);

    console.log(`Balance of ${userAddr}:`, balance.toString());

    res.send(`Balance is ${ethers.utils.formatUnits(balance, 18)}`);
  } catch (e) {
    console.log("Error while fetching balance...", e);

    res.status(500).send("error");
  }
});
