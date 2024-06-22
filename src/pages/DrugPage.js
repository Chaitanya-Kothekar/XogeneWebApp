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
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`);
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

        const drugDetails = sbdConcept.conceptProperties[0];
        setDrugDetails(drugDetails);

        const rxcui = drugDetails.rxcui;
        if (rxcui) {
          const ndcResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/ndcs.json`);
          const ndcList = ndcResponse.data.ndcGroup.ndcList || [];
          setNdcs(Array.isArray(ndcList) ? ndcList : []);
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
    return <div className="text-red-500">{error}</div>;
  }

  if (!drugDetails) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">{drugDetails.name}</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg w-full sm:w-2/3">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Drug Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about the drug</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">RXCUI</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{drugDetails.rxcui}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Synonym</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{drugDetails.synonym}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8 w-full sm:w-2/3">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">NDCs Associated with {drugDetails.name}</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NDCs
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ndcs.length > 0 ? ndcs.map((ndc, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ndc}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No NDCs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DrugPage;
