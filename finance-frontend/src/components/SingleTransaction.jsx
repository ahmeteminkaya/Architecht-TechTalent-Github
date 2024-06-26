import { Link } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const SingleTransaction = ({ transaction, onDelete }) => {

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const formatDateTime = (dateString) => {
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const date = new Date(dateString);
    return `${date.toLocaleDateString(undefined, optionsDate)} - ${date.toLocaleTimeString(undefined, optionsTime)}`;
  };
  const  handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `https://localhost:7077/transactions/${transaction.id}`
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }

    onDelete(transaction.id)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">{transaction.category}</h3>
          <h3 className="text-l font-bold text-gray-800">{formatDateTime(transaction.transactionDate)}</h3>
        </div>

        <div className="mb-4 text-gray-600">{transaction.description}</div>

        <h3 className="text-2xl font-semibold text-blue-500 mb-4">{transaction.amount} TL</h3>

        <div className="border-t border-gray-200 mb-4"></div>

        <div className="flex justify-end">
          <Link
            to={`/editTransaction/${transaction.id}`}
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className='inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium ml-2'>
              Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleTransaction;
