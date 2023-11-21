import "./App.css";
import Header from "./components/Header.jsx";
import { Routes, Route } from 'react-router-dom';
import Tokens from "./components/Tokens.jsx"
import Swap from "./components/Swap.jsx";
import { useConnect, useAccount } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Warning from "./components/Warning.jsx";

function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });

  return (
    <>
      <div className="App">
        <Warning/>
        <Header connect={connect} isConnected={isConnected} address={address} />
        <div className="mainWindow">
          <Routes>
            <Route path="/" element={<Swap isConnected={isConnected} address={address} />} />
            <Route path="/tokens" element={<Tokens />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App;
