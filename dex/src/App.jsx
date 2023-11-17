import "./App.css";
import Header from "./components/Header.jsx";
import {Routes, Route} from 'react-router-dom';
import Tokens from "./components/Tokens.jsx"
import Swap from "./components/Swap.jsx";

function App() {
  return (
    <>
    <div className="App">
      <Header/>
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap/>}/>
          <Route path="/tokens" element={<Tokens/>}/>
        </Routes>
      </div>
    </div>
    </>
  )
}

export default App;
