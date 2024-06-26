import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7077/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/442c1ea20cd10127759a789e/latest/USD');
        setExchangeRates(response.data.conversion_rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchUser();
    fetchExchangeRates();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || !exchangeRates) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
          <p className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">{user.userName}</p>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <p className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Balance</label>
          <p className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">{user.balance} TL</p>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Account Number</label>
          <p className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">{user.accountNumber}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4">
          <Link
            to='/transaction'
            className='flex-1 text-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600'
          >
            Make Transaction
          </Link>
          <Link
            to='/transfer'
            className='flex-1 text-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600'
          >
            Make Transfer
          </Link>
          <Link
            to='/mytransactions'
            className='flex-1 text-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600'
          >
            See Transactions
          </Link>
          <Link
            to='/mytransfers'
            className='flex-1 text-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600'
          >
            See Transfers
          </Link>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Exchange Rates</h3>
          <div className="space-y-2">
            {Object.keys(exchangeRates).slice(0, 5).map((currency) => (
              <div key={currency} className="flex justify-between items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <span className="text-gray-700">{currency}</span>
                <span className="text-gray-700">{exchangeRates[currency]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
