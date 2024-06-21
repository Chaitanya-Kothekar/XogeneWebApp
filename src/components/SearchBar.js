// src/components/SearchBar.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const searchDrugs = async () => {
    try {
      const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
      const drugs = response.data?.drugGroup?.conceptGroup?.flatMap(group => group.conceptProperties || []);
      if (drugs.length > 0) {
        setSuggestions(drugs.map(drug => ({ name: drug.name })));
        setError('');
      } else {
        const suggestionResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${query}`);
        const spellingSuggestions = suggestionResponse.data?.suggestionGroup?.suggestionList?.suggestion || [];
        if (spellingSuggestions.length > 0) {
          setSuggestions(spellingSuggestions.map(suggestion => ({ name: suggestion.suggestion })));
          setError('');
        } else {
          setSuggestions([]);
          setError('Nothing found');
        }
      }
    } catch (err) {
      setError('Error fetching data');
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      searchDrugs();
    }
  };

  const handleClick = (name) => {
    navigate(`/drugs/${name}`);
  };

  return (
    <div className="search-bar flex flex-col items-center">
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleSearch}
          className="input pl-3 bg-white border-2 border-black rounded-md"
          placeholder="Search for a drug"
        />
        <button onClick={searchDrugs} className="btn-search bg-black text-white rounded-md p-2">Search</button>
      </div>
      <div className="suggestions w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <div key={index} onClick={() => handleClick(suggestion.name)} className="cursor-pointer p-2 border-b hover:bg-gray-100">
            {suggestion.name}
          </div>
        ))}
        {error && <div className="error text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export default SearchBar;
