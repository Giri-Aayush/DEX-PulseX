const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const {query} = req;
  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne
  })

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo
  })

  console.log(responseOne.raw);  
  console.log(responseTwo.raw);  
  return res.status(200).json({});
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
