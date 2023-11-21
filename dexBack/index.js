const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
const axios = require('axios');
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/fetchDexApproval", async (req, res) => {
  const tokenAddress = req.query.tokenAddress;
  const walletAddress = req.query.walletAddress;
  const apiURL = "https://api.1inch.dev/swap/v5.2/1/approve/allowance";

  try {
    const response = await axios.get(apiURL, {
      headers: {
        "Authorization": "Bearer VQQUXB0pcQ68ErSmATUPYkvZa67ZCrg0", // Your API key
      },
      params: {
        tokenAddress,
        walletAddress
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while fetching data');
  }
});

app.get("/approveTransaction", async (req, res) => {
  const tokenAddress = req.query.tokenAddress;
  const apiURL = "https://api.1inch.dev/swap/v5.2/1/approve/transaction";

  try {
    const response = await axios.get(apiURL, {
      headers: {
        "Authorization": "Bearer VQQUXB0pcQ68ErSmATUPYkvZa67ZCrg0" // Replace with your actual API key
      },
      params: {
        tokenAddress
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while fetching data');
  }
});

// In your Express.js backend

app.get("/fetchSwapCalldata", async (req, res) => {
  const { src, dst, amount, from, slippage } = req.query;
  const url = "https://api.1inch.dev/swap/v5.2/1/swap";

  try {
    const response = await axios.get(url, {
      headers: {
        "Authorization": "Bearer VQQUXB0pcQ68ErSmATUPYkvZa67ZCrg0" // Replace with your actual API key
      },
      params: {
        src,
        dst,
        amount,
        from,
        slippage
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while fetching swap calldata');
  }
});




app.get("/tokenPrice", async (req, res) => {
  const {query} = req;
  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne
  })

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo
  })
 
  const usdPrices = {
    tokenOne : responseOne.raw.usdPrice,
    tokenTwo : responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice/responseTwo.raw.usdPrice
  }

  return res.status(200).json(usdPrices);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
