import React from 'react'
import Dashboard from './components/DashBoard'
import SearchResults from './components/SearchResults'
import AdvancedSearch from './components/AdvancedSearch'
import Layout from './pages/Layout'
import Dashboard1 from './components/Dashboard1'
const App = () => {
  return (
    <div>
      <Layout>
        <Dashboard1 />
        {/* <SearchResults /> */}
        {/* <AdvancedSearch /> */}
      </Layout>
    </div>
  )
}

export default App