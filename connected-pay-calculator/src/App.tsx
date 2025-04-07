import './App.css'
import ContractDetailsForm from './components/ContractDetailsForm'
import connectedLogo from './assets/chc-logo.png'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="w-full px-8 py-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo only */}
            <div className="flex items-center">
              <img 
                src={connectedLogo} 
                alt="Connected Logo" 
                className="h-8 object-contain"
              />
            </div>

            {/* Modern Blue Header */}
            <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-5 shadow-lg">
              <h2 className="text-white text-xl text-center font-medium tracking-wide">
                Pay Package Builder
              </h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ContractDetailsForm />
        </div>
      </main>
    </div>
  )
}

export default App
