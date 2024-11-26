import React from 'react'
import { useLocation } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const DrugCountsChart = ({ data, diseaseName }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Drug Counts by Manufacturer for {diseaseName}</CardTitle>
      <CardDescription>Number of drugs produced by each manufacturer</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Manufacturer" />
          <YAxis />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-4 border rounded shadow">
                    <p><strong>Manufacturer:</strong> {data.Manufacturer}</p>
                    <p><strong>Drug Count:</strong> {data.Drug_Count}</p>
                    <p><strong>Drugs:</strong> {data.Drug_Names}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="Drug_Count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const MarketShareChart = ({ data, diseaseName }) => {
  const pieData = Object.entries(data).map(([name, value]) => ({ name, value }))
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Share for Manufacturers in {diseaseName}</CardTitle>
        <CardDescription>Distribution of market share among manufacturers</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const RevenueOverYearsChart = ({ data, diseaseName }) => {
  const processedData = data.reduce((acc, item) => {
    const year = item.Year.split('_')[1]
    if (!acc[year]) {
      acc[year] = { year }
    }
    acc[year][item.Manufacturer] = item.Revenue
    return acc
  }, {})

  const chartData = Object.values(processedData)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue vs Year for Manufacturers in {diseaseName}</CardTitle>
        <CardDescription>Revenue trends over the years for each manufacturer</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(chartData[0] || {}).filter(key => key !== 'year').map((manufacturer, index) => (
              <Line 
                key={manufacturer} 
                type="monotone" 
                dataKey={manufacturer} 
                stroke={COLORS[index % COLORS.length]} 
                activeDot={{ r: 8 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const DrugTypeDistributionChart = ({ data, diseaseName }) => {
  const pieData = Object.entries(data).map(([name, value]) => ({ name, value }))
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Drug Type Distribution for Treatment of {diseaseName}</CardTitle>
        <CardDescription>Distribution of different types of drugs used for treatment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const DiseaseAnalysis = () => {
  const location = useLocation()
  const { searchResults: data, diseaseName } = location.state || {}

  console.log(diseaseName);

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold mb-4">Competitive Landscape for: <span className="text-[#a6ce39]">{diseaseName}</span></h1>
      {data.drug_counts && <DrugCountsChart data={data.drug_counts} diseaseName={diseaseName} />}
      {data.market_share && <MarketShareChart data={data.market_share} diseaseName={diseaseName} />}
      {data.revenue_by_year && <RevenueOverYearsChart data={data.revenue_by_year} diseaseName={diseaseName} />}
      {data.drug_type_distribution && <DrugTypeDistributionChart data={data.drug_type_distribution} diseaseName={diseaseName} />}
    </div>
  )
}

export default DiseaseAnalysis
