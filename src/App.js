import './App.css';
import React, { useCallback, useState, useEffect } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import stealableContractAbi from "./abi/StealableContract.json";
import { ethers } from 'ethers'
import { getChain } from 'evm-chains'
import Loader from "react-loader-spinner";

const injectedConnector = new InjectedConnector({ supportedChainIds: [0x61] });
const walletConnect = new WalletConnectConnector({
  supportedChainIds: [0x61],
  rpc: { 0x61: "https://data-seed-prebsc-1-s1.binance.org:8545/"},
  qrcode: true,
})
const connector = injectedConnector


const LoadingButton = ({loading, children, onClick}) => {
  return <button onClick={onClick}>
      {loading ?
      <Loader
        type="ThreeDots"
        color="#FFFFFF"
        height={100}
        width={100}
      />
      : children}
  </button>
}

const Main = () => {
  const { library, chainId, account, activate, deactivate, active } = useWeb3React()
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    try {
      await activate(connector, undefined, true)
    } catch (err) {
      // https://github.com/NoahZinsmeister/web3-react/issues/217
      if (connector === walletConnect) {
        connector.walletConnectProvider = undefined;
      }
    }
  }, [connector])

  const refreshOwner = async () => {
    if (active) {
      const contract = new ethers.Contract("0xC9EF3209652efd9bEd191E3a6a9CD720Cb5Ee388", stealableContractAbi, library);
      const o = await contract.owner();
      setOwner(o);
    }
  }

  useEffect(refreshOwner, [library, active]);

  const steal = useCallback(async () => {
    if (active) {
      const contract = new ethers.Contract("0xC9EF3209652efd9bEd191E3a6a9CD720Cb5Ee388", stealableContractAbi, library);
      let promise = contract.connect(library.getSigner()).steal();
      setLoading(true);
      let tx = await promise;
      await tx.wait();
      setLoading(false);
      await refreshOwner();
    }
  }, [library, active]);

  return (
    <div>
      <div>ChainId: {chainId ? getChain(chainId).name: "Loading..."}</div>
      <div>Account: {account}</div>
      <div>Owner: {owner == null ? "Loading...": owner}</div>
      {active ? (
        <div>Connected: ✅</div>
      ) : (
        <button type="button" onClick={connect}>
          Connect
        </button>
      )}
      <LoadingButton onClick={steal} loading={loading}>Steal</LoadingButton>
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
