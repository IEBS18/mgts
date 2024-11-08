import { useRef, useState } from "react";
import * as d3 from "d3";

const WorldMap = ({ width, height, data, diseaseData }) => {
  const { worldPopulation, topography } = data;
  const chartRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    name: "",
    population: "",
    diseaseCount: "",
    avgMortality: "",
    lowestPricedDrug: "",
    drugSize: "",
    x: 0,
    y: 0,
  });

  // Map and projection
  const path = d3.geoPath();
  const projection = d3
    .geoMercator()
    .scale(85)
    .center([0, 30])
    .translate([width / 2, height / 2]);

  const pathGenerator = path.projection(projection);

  // Color scale for countries without diseaseData
  const colorScale = d3
    .scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeGreens[7]);

  return (
    <div className="container" style={{ position: "relative" }}>
      <svg
        ref={chartRef}
        className="viz"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <g className="topography">
          {topography.features.map((d) => {
            const countryName = d.properties.name;
            const countryCode = d.id;
            const population = worldPopulation[countryCode] || 0; // Default to 0 if population is missing

            // Check if the country has disease data
            const countryDiseaseData = diseaseData[countryName];
            const isHovered = hoveredCountry === countryName;

            // Ensure colorScale gets a valid value for countries without population data
            const fillColor = countryDiseaseData
              ? isHovered
                ? "#04165d" // Darker blue when hovered
                : "#29c4f8" // Blue for countries with diseaseData
              : colorScale(population || 0); // Default to population-based color scale if no diseaseData

            return (
              <path
                key={d.id}
                d={pathGenerator(d)}
                fill={fillColor}
                stroke={isHovered ? "#29c4f8" : "#7f7f7f"} // Gray stroke for non-hovered countries
                strokeWidth={isHovered ? 1 : 0.3}
                onMouseEnter={() => {
                  setTooltipVisible(true);
                  setHoveredCountry(countryName);
                }}
                onMouseLeave={() => {
                  setTooltipVisible(false);
                  setHoveredCountry(null);
                }}
                onMouseMove={(event) => {
                  const [x, y] = d3.pointer(event, chartRef.current);

                  // Update tooltip based on disease data availability
                  setTooltipData({
                    name: countryName,
                    population: population.toLocaleString(),
                    diseaseCount: countryDiseaseData ? countryDiseaseData.diseaseCount : "",
                    avgMortality: countryDiseaseData ? countryDiseaseData.avgMortality.toFixed(2) : "",
                    lowestPricedDrug: countryDiseaseData ? countryDiseaseData.lowestPricedDrug.name : "N/A",
                    drugSize: countryDiseaseData ? countryDiseaseData.lowestPricedDrug.size : "N/A",
                    x: x + 10,
                    y: y - 20,
                  });
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipVisible && (
        <div
          className="tooltip font-bold"
          style={{
            position: "absolute",
            left: tooltipData.x,
            top: tooltipData.y,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 10, // Make sure tooltip is above the map
          }}
        >
          <div>{tooltipData.name}</div>
          <div>Population: {tooltipData.population}</div>
          {tooltipData.diseaseCount && (
            <>
              <div>Medicine Count: {tooltipData.diseaseCount}</div>
              <div>Avg. Mortality: {tooltipData.avgMortality}</div>
              <div>Lowest Priced Drug: {tooltipData.lowestPricedDrug}</div>
              <div>Drug Size: {tooltipData.drugSize}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
