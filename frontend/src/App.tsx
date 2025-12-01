import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>🎁 NFT Gift Protocol</h1>
        <p className="testnet-badge">Polygon Mumbai Testnet Only</p>
      </header>
      
      <main>
        <div className="hero">
          <h2>Create Personalized NFT Gift Cards</h2>
          <p>
            Send unique, AI-generated gift cards with embedded tokens on the blockchain.
          </p>
        </div>
        
        <div className="info-section">
          <h3>⚠️ Testnet Project</h3>
          <p>
            This project runs exclusively on Polygon Mumbai testnet. 
            No real tokens or value are involved.
          </p>
          <a 
            href="https://faucet.polygon.technology/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="faucet-link"
          >
            Get Test MATIC from Faucet →
          </a>
        </div>
      </main>
    </div>
  )
}

export default App
