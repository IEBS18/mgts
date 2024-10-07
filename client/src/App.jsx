import React from 'react'
import Dashboard from './components/DashBoard'
import SearchResults from './components/SearchResults'
import AdvancedSearch from './components/AdvancedSearch'

const App = () => {
  return (
    <div>
      <Dashboard />
      <SearchResults />
      <AdvancedSearch />
    </div>
  )
}

export default App