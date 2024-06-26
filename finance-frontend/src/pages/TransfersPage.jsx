import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SingleTransfer from '../components/SingleTransfer';
import { Link } from 'react-router-dom';


const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7077/mytransfers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransfers(response.data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };

    fetchTransfers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">Transfers</h2>
          <Link
            to="/profile"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Profile
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transfers.map((transfer) => (
            <SingleTransfer key={transfer.id} transfer={transfer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransfersPage;
