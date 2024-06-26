import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MakeTransactionPage = () => {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  const makeTransaction = async (newTransaction) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7077/make-transaction', 
        newTransaction,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    } catch (error) {
      console.error('Failed to make transaction:', error);
    }
  }

  const submitForm = (e) => {
    e.preventDefault();

    const newTransaction = {
      amount,
      category,
      description
    };

    makeTransaction(newTransaction);
    navigate('/profile');
  };

  return (
    <section className='bg-indigo-50 min-h-screen flex items-center'>
      <div className='container m-auto max-w-2xl py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-lg border m-4 md:m-0'>
          <form onSubmit={submitForm}>
            <h2 className='text-3xl text-center font-semibold mb-6 text-gray-800'>Add Transaction</h2>

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

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Category
              </label>
              <input
                type='text'
                id='category'
                name='category'
                className='border border-gray-300 rounded w-full py-2 px-3 mb-2 bg-gray-50'
                placeholder='Category'
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='description'
                className='block text-gray-700 font-bold mb-2'
              >
                Description
              </label>
              <textarea
                id='description'
                name='description'
                className='border border-gray-300 rounded w-full py-2 px-3 bg-gray-50'
                rows='4'
                placeholder='Add description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline'
                type='submit'
              >
                Make Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default MakeTransactionPage;
