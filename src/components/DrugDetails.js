import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const DrugPage = () => {
  const { drugName } = useParams();
  const [drugDetails, setDrugDetails] = useState(null);
  const [ndcs, setNdcs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${drugName}`);
        const drugGroup = response.data.drugGroup;

        if (!drugGroup || !drugGroup.conceptGroup || drugGroup.conceptGroup.length === 0) {
          setError('Drug details not found');
          return;
        }

        const sbdConcept = drugGroup.conceptGroup.find(group => group.tty === 'SBD');
        if (!sbdConcept || !sbdConcept.conceptProperties || sbdConcept.conceptProperties.length === 0) {
          setError('Drug details not found');
          return;
        }

        const drugInfo = sbdConcept.conceptProperties[0];
        setDrugDetails(drugInfo);

        const rxcui = drugInfo.rxcui;
        if (rxcui) {
          const ndcResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/ndcs.json`);
          const ndcList = ndcResponse.data.ndcProperties || [];
          setNdcs(ndcList);
        } else {
          setError('RXCUI not found');
        }
      } catch (err) {
        setError('Error fetching drug details');
      }
    };

    fetchDrugDetails();
  }, [drugName]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!drugDetails) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="drug-page">
      <h2>{drugDetails.name}</h2>
      <p><strong>RXCUI:</strong> {drugDetails.rxcui}</p>
      <p><strong>Synonym:</strong> {drugDetails.synonym}</p>

      <h3>NDCs Associated with {drugDetails.name}</h3>
      <ul>
        {ndcs.map((ndc, index) => (
          <li key={index}>{ndc.ndc}</li>
        ))}
      </ul>
    </div>
  );
};

export default DrugPage;
