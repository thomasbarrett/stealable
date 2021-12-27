import './App.css';
import { useCallback, useState, useEffect } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import stealableContractAbi from "./abi/StealableContract.json";
import { ethers } from 'ethers'
export const injectedConnector = new InjectedConnector({ supportedChainIds: [0x61] });

const Main = () => {
  const { library, chainId, account, activate, active } = useWeb3React()
  const [owner, setOwner] = useState(null)
  const connect = useCallback(async () => {
    await activate(injectedConnector)
  })

  useEffect(async () => {
    if (active) {
      const contract = new ethers.Contract("0xC9EF3209652efd9bEd191E3a6a9CD720Cb5Ee388", stealableContractAbi, library);
      const o = await contract.owner();
      setOwner(o);
    }
  }, [library, active]);

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      <div>Owner: {owner == null ? "Loading...": owner}</div>
      {active ? (
        <div>✅</div>
      ) : (
        <button type="button" onClick={connect}>
          Connect
        </button>
      )}
    </div>
  )
}

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Main></Main>
    </Web3ReactProvider>
  );
}

export default App;
