import React from 'react'
import Dashboard from './components/DashBoard'
import SearchResults from './components/SearchResults'
import AdvancedSearch from './components/AdvancedSearch'
import Layout from './pages/Layout'
const App = () => {
  return (
    <div>
      <Layout>
        <Dashboard />
        {/* <SearchResults /> */}
        {/* <AdvancedSearch /> */}
      </Layout>
    </div>
  )
}

export default App