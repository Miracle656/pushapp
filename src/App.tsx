import { useState } from 'react'
import viteLogo from '/vite.svg'
import pushlogo from './assets/pushchainlogo.png'
import SimpleCounterExample from './examples/SimpleCounter'
import UniversalCounterExample from './examples/UniversalCounter'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="logo-container">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://push.org/" target="_blank">
          <img src={pushlogo} className="logo push" alt="Push logo" />
        </a>
      </div>
      <h1>Vite + Push</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <SimpleCounterExample />
        <UniversalCounterExample />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and Push logos to learn more
      </p>
      <p>
        More usefull links:
        <a href="https://push.org/" target="_blank">Push Website</a>&nbsp;
        <a href="https://github.com/pushchain" target="_blank">Push Github Repo</a>&nbsp;
        <a href ="https://portal.push.org/rewards" target="_blank">Push Rewards</a>&nbsp;
        <a href ="https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/" target="_blank">Push Documentation</a>&nbsp;
      </p>
    </>
  )
}

export default App
