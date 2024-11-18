import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Input } from './ui/input';

const SymptomResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults } = location.state || {};
  const { symptoms } = location.state; // Get data passed through location.state
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const resultsPerPage = 25;

  // Filter results based on search term
  const filteredResults = searchResults.filter(result =>
    result.Disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result['Signs & Symptoms'].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightText = (text = '', highlight = '', wordLimit) => {
    if (!text || !highlight.trim()) {
      return text;
    }

    const highlightWords = highlight.split(' ').filter(Boolean);
    const regexPattern = highlightWords.map(word => `(${word})`).join('|');
    const regex = new RegExp(regexPattern, 'gi');

    // Find matches in the text
    const matches = text.match(regex);

    if (matches) {
      const index = text.search(regex);

      // If wordLimit is provided, trim the text
      if (wordLimit && wordLimit > 0) {
        const start = Math.max(0, index - wordLimit);
        const end = Math.min(text.length, index + wordLimit);
        const snippet = text.substring(start, end);

        // Highlight matching parts within the snippet
        return (
          <>
            <i>{snippet.split(regex).map((part, i) =>
              regex.test(part) ? (
                <mark key={i} className="bg-yellow-200">{part}</mark>
              ) : (
                part
              )
            )}</i>
            {end < text.length && '...'} {/* Add ellipsis if text is trimmed */}
          </>
        );
      }

      // If no wordLimit is provided, highlight throughout the entire text
      return (
        <>
          <i>{text.split(regex).map((part, i) =>
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-200">{part}</mark>
            ) : (
              part
            )
          )}</i>
        </>
      );
    }

    // If no match is found, return the text as is (or trimmed if wordLimit is provided)
    return <i>{wordLimit ? text.substring(0, wordLimit) + '...' : text}</i>;
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  // Get the current page's data
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);

  // Handle card selection
  const handleCardSelection = (result) => {
    setSelectedCards((prevSelected) =>
      prevSelected.includes(result)
        ? prevSelected.filter((card) => card !== result)
        : [...prevSelected, result]
    );
  };

  // Handle navigation to the disease search page with detailed data
  const handleViewDetail = (result) => {
    navigate('/disease-search', {
      state: { searchResults: result }, // Pass selected result to the new page
    });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full p-6 flex justify-center">
      <div className="w-full overflow-y-auto pr-2 scrollbar-hide">
        <div className='flex flex-row w-full gap-x-4 justify-end'>
          <div className='w-2/3 '>
            <h1 className="text-2xl font-bold text-gray-800">
              Showing Relevant Diseases for Symptoms: <span className="text-[#a6ce39]">{symptoms || "Symptoms"}</span>
            </h1>
          </div>
          <div className='w-1/2'>
            <div className="w-full flex justify-end ">
              <Input
                type="text"
                placeholder="Filter diseases or symptoms..."
                className="border border-green focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-green rounded-lg p-2 w-[100px] md:w-1/2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

        </div>


        {/* Search Box */}


        {/* Disease Table */}
        <div className="mt-6 mb-4">
          <table className="w-full table-auto border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 bg-lightBlue text-white rounded-tl-lg">Disease</th>
                <th className="text-left px-4 py-2 bg-lightBlue text-white">Symptoms</th>
                <th className="text-left px-4 py-2 bg-lightBlue text-white rounded-tr-lg">More Info</th>
              </tr>
            </thead>
            <tbody>
              {currentResults?.map((result, index) => (
                <tr key={index} className="bg-white border-b hover:bg-[#f1f5f8]">
                  <td className="px-4 py-2">{highlightText(result.Disease, searchTerm)}</td>
                  <td className="px-4 py-2">{highlightText(result['Signs & Symptoms'], searchTerm)}</td>
                  <td className="px-4 py-2">
                    <Button
                      className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                      onClick={() => handleViewDetail(result)}
                    >
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 gap-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            Previous
          </Button>
          <span className="self-center text-lg">{`Page ${currentPage} of ${totalPages}`}</span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SymptomResultsPage;
