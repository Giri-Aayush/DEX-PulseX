import React, { useEffect, useState } from 'react'
import { Input, Popover, Radio, Modal, message } from "antd";
import { DownOutlined, ArrowDownOutlined, SettingOutlined } from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from 'axios';
import { useSendTransaction, useWaitForTransaction } from "wagmi";

function Swap(props) {
  const { isConnected, address } = props;

  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);

  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);

  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value)
    }
  })

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(3))
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {

    setChangeToken(asset);
    setIsOpen(true);

  }

  function modifyToken(index) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[index]);
      fetchPrices(tokenList[index].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[index]);
      fetchPrices(tokenOne.address, tokenList[index].address);
    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/tokenPrice`, {
      params: {
        addressOne: one,
        addressTwo: two
      }
    })
    setPrices(res.data);
  }

  async function fetchDexApproval() {
    const url = `${process.env.REACT_APP_BACKEND_SERVER_URL}/fetchDexApproval`; // URL of your backend route
  
    const config = {
      params: {
        "tokenAddress": tokenOne.address,
        "walletAddress": address
      }
    };
  
    try {
      const response = await axios.get(url, config);
      console.log("approved");
      console.log(response.data);
      return response.data.allowance;
    } catch (error) {
      console.error(error);
    }
  }

  async function makeDexApprove() {
    const url = `${process.env.REACT_APP_BACKEND_SERVER_URL}/approveTransaction`;
  
    const config = {
      params: {
        "tokenAddress" : tokenOne.address
      }
    };
  
    try {
      const response = await axios.get(url, config);
      console.log("Transaction approval:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in transaction approval:", error);
    }
  }

  async function fetchDexSwapCalldata() {
  const url = `${process.env.REACT_APP_BACKEND_SERVER_URL}/fetchSwapCalldata`;
  const amountOne = convertToSmallestUnit(Number(tokenOneAmount), tokenOne.decimals)

  try {
    const response = await axios.get(url, {
      params: {
        "src": tokenOne.address,
        "dst": tokenTwo.address,
        "amount": String(amountOne),
        "from": address,
        "slippage": slippage*10
      }
    });
    console.log('Swap calldata:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error in fetching swap calldata:", error);
  }
}

  

  async function fetchDexSwap(){
    const approval = await fetchDexApproval();
    console.log("here");
    console.log(typeof(approval));
    if(approval === "0"){
      await new Promise(resolve => setTimeout(resolve, 1001));
      await makeDexApprove();
      //actually send  approval transaction here
    }
    await new Promise(resolve => setTimeout(resolve, 1001));
    const response = await fetchDexSwapCalldata();
    console.log(response);
    //make actual swap using transaction send
  }
  
  function convertToSmallestUnit(amount, decimals) {
    // Convert the number of decimals into the corresponding multiplier
    const multiplier = Math.pow(10, decimals);
  
    // Convert the human-readable amount to the smallest unit
    const smallestUnitAmount = Math.round(amount * multiplier);
  
    return smallestUnitAmount;
  }


useEffect(() => {
  fetchPrices(tokenList[0].address, tokenList[1].address)
}, [])

useEffect(() => {
  if (txDetails.to && isConnected) {
    sendTransaction();
  }
}, [txDetails])

const settings = (
  <>
    <div>Slippage Tolerance</div>
    <div>
      <Radio.Group value={slippage} onChange={handleSlippageChange}>
        <Radio.Button value={0.5}>0.5%</Radio.Button>
        <Radio.Button value={2.5}>2.5%</Radio.Button>
        <Radio.Button value={5.0}>5.0%</Radio.Button>
      </Radio.Group>
    </div>
  </>
)

return (
  <>
    <Modal
      open={isOpen}
      footer={null}
      onCancel={() => setIsOpen(false)}
      title="Select a token"
    >
      <div className="modalContent">
        {tokenList?.map((e, i) => {
          return (
            <div
              className="tokenChoice"
              key={i}
              onClick={() => modifyToken(i)}
            >
              <img src={e.img} alt={e.ticker} className="tokenLogo" />
              <div className="tokenChoiceNames">
                <div className="tokenName">{e.name}</div>
                <div className="tokenTicker">{e.ticker}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
    <div className='tradeBox'>
      <div className='tradeBoxHeader'>
        <h4>Swap</h4>
        <Popover
          content={settings}
          title='Settings'
          trigger="click"
          placement='bottomRight'
        >
          <SettingOutlined className='cog' />
        </Popover>
      </div>
      <div className='inputs'>
        <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} disabled={!prices} />
        <Input placeholder='0' value={tokenTwoAmount} disabled={true} />
        <div className='switchButton' onClick={switchTokens}>
          <ArrowDownOutlined className='switchArrow' />
        </div>
        <div className='assetOne' onClick={() => openModal(1)}>
          <img src={tokenOne.img} alt='assetOneLogo' className='assetLogo' />
          {tokenOne.ticker}
          <DownOutlined />
        </div>
        <div className='assetTwo' onClick={() => openModal(2)}>
          <img src={tokenTwo.img} alt='assetTwoLogo' className='assetLogo' />
          {tokenTwo.ticker}
          <DownOutlined />
        </div>
      </div>
      <div className='swapButton' disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
    </div>
  </>
);
        }

export default Swap