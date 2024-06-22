import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Shimmer from './Shimmer';
import { RiSearchLine } from 'react-icons/ri'; // Importing RiSearchLine icon

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const searchDrugs = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
      const drugGroup = response.data.drugGroup;

      if (!drugGroup || !drugGroup.conceptGroup || drugGroup.conceptGroup.length === 0) {
        setSuggestions([]);
        fetchSuggestions(query);
        return;
      }

      const sbdConcept = drugGroup.conceptGroup.find(group => group.tty === 'SBD');
      if (!sbdConcept || !sbdConcept.conceptProperties || sbdConcept.conceptProperties.length === 0) {
        setSuggestions([]);
        fetchSuggestions(query);
        return;
      }

      const drugs = sbdConcept.conceptProperties.map(property => ({
        name: property.name,
        rxcui: property.rxcui,
        synonym: property.synonym
      }));

      // Filter suggestions based on query match
      const filteredSuggestions = drugs.filter(drug => drug.name.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(filteredSuggestions);
      setError('');
    } catch (err) {
      setError('Error fetching data');
      setSuggestions([]);
    }
    setLoading(false);
  };

  const fetchSuggestions = async (query) => {
    setLoading(true);
    try {
      const suggestionResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${query}`);
      const spellingSuggestions = suggestionResponse.data.suggestionGroup.suggestionList.suggestion || [];
      if (spellingSuggestions.length > 0) {
        setSuggestions(spellingSuggestions.map(suggestion => ({ name: suggestion })));
        setError('');
      } else {
        setError('No suggestions found');
        setSuggestions([]);
      }
    } catch (err) {
      setError('Error fetching suggestions');
      setSuggestions([]);
    }
    setLoading(false);
  };

  const debouncedFetchSuggestions = useCallback(debounce(searchDrugs, 300), []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') {
      setSuggestions([]);
      setError('');
    } else {
      debouncedFetchSuggestions(value);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      await searchDrugs(query);
    }
  };

  const handleClick = (name) => {
    navigate(`/drugs/${name}`);
  };

  return (
    <div className="search-bar flex justify-center items-center w-full">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleSearch}
          className="input pl-3 bg-white border-2 border-black w-full"
          placeholder="Search for a drug"
        />
        <div className="absolute bg-white border border-gray-300 mt-1 rounded-lg w-full shadow-lg z-10">
          {loading && <Shimmer />}
          {!loading && query && suggestions.length > 0 && (
            suggestions.map((suggestion, index) => (
              <div key={index} onClick={() => handleClick(suggestion.name)} className="suggestion-item cursor-pointer p-2 hover:bg-gray-200 flex items-center">
                <RiSearchLine className="mr-2" /> {/* Search icon */}
                {suggestion.name}
              </div>
            ))
          )}
          {!loading && query && suggestions.length === 0 && error && (
            <div className="p-2 text-gray-500">{error}</div>
          )}
        </div>
      </div>
      <button onClick={() => searchDrugs(query)} className="btn-search bg-black w-[5vw] rounded-md p-2 text-white ml-5">Search</button>
    </div>
  );
};

export default SearchBar;
