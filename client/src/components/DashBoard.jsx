// import React, { useState } from 'react'
// import { Bell, Search } from 'lucide-react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"


// export default function Dashboard() {
//   const workflows = [
//     { title: "Search Drugs", description: "Find approved and pipeline drugs" },
//     { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
//     { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
//     { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
//   ]

//   const [query,setQuery] = useState("");
//   const [data, setData] = useState(null);

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Main Content */}
//       <main className="flex-1 p-8">
//         <div className="max-w-4xl mx-auto">
//           <header className="flex justify-between items-center mb-8">
//             <h1 className="text-3xl font-bold">Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span></h1>
//             <Bell className="h-6 w-6" />
//           </header>

//           <div className="mb-8">
//             <Input type="text" placeholder="prevalence of multiple myeloma in the us" className="w-full" value={query} />
//           </div>

//           {/* <div className="flex items-center justify-between mb-8">
//             <h2 className="text-xl font-semibold">Select a workflow</h2>
//             <div className="flex items-center">
//               <span className="mr-2 text-sm">Search Internal Documents Only</span>
//               <Switch />
//             </div>
//           </div> */}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {workflows.map((workflow, index) => (
//               <Card key={index}>
//                 <CardHeader>
//                   <CardTitle>{workflow.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription>{workflow.description}</CardDescription>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//         {/* <SearchResults /> */}
//       </main>

//     </div>
//   )
// }



import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SearchResults from './SearchResults'

export default function Dashboard() {
  const workflows = [
    { title: "Search Drugs", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
  ]

  const [query, setQuery] = useState("");  // State for storing input value
  const [data, setData] = useState(null);  // State for storing response data

  // Function to handle the POST request
  const handleSearch = async () => {
    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'keyword': query }),  // Send the query as the POST body
      });

      const result = await response.json();
      setData(result);  // Update the data state with the response
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span></h1>
            <Bell className="h-6 w-6" />
          </header>

          <div className="mb-8 flex">
            {/* Input field with onChange handler */}
            <Input
              type="text"
              placeholder="Enter your search query"
              className="w-full mr-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}  // Update query state
            />

            {/* Button to trigger POST request */}
            <Button variant="secondary" onClick={handleSearch} className="ml-2">Search</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{workflow.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Display the response data if available */}
          {data && (
            <SearchResults data={data}/>
            // <div className="mt-8">
            //   <h2 className="text-xl font-semibold">Search Results:</h2>
            //   <pre>{JSON.stringify(data, null, 2)}</pre>
            // </div>
          )}
        </div>
      </main>
    </div>
  )
}
