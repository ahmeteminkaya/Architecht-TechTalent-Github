import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MakeTransferPage = () => {
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [amount, setAmount] = useState(0);

  const navigate = useNavigate();

  const makeTransfer = async (newTransfer) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7077/make-transfer', 
        newTransfer,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    } catch (error) {
      console.error('Failed to make transfer:', error);
    }
  }
  
  const submitForm = (e) => {
    e.preventDefault();

    const newTransfer = {
      receiverAccountNumber,
      amount
    };
    
    makeTransfer(newTransfer);
    navigate('/profile');
  };

  return (
    <section className='bg-indigo-50 min-h-screen flex items-center'>
      <div className='container m-auto max-w-2xl py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-lg border m-4 md:m-0'>
          <form onSubmit={submitForm}>
            <h2 className='text-3xl text-center font-semibold mb-6 text-gray-800'>Make Transfer</h2>
            
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Receiver Account Number
              </label>
              <input
                type='text'
                id='receiverAccountNumber'
                name='receiverAccountNumber'
                className='border border-gray-300 rounded w-full py-2 px-3 mb-2 bg-gray-50'
                placeholder='Receiver Account Number'
                required
                value={receiverAccountNumber}
                onChange={(e) => setReceiverAccountNumber(e.target.value)}
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Amount
              </label>
              <input
                type='number'
                id='amount'
                name='amount'
                className='border border-gray-300 rounded w-full py-2 px-3 mb-2 bg-gray-50'
                placeholder='0'
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline'
                type='submit'
              >
                Make Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default MakeTransferPage;
