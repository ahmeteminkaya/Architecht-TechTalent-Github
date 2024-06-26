import { Link } from 'react-router-dom';

const SingleTransfer = ({ transfer }) => {
  
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">Sender: {transfer.senderAccountNumber}</h3>
          <h3 className="text-xl font-bold text-gray-800">Receiver: {transfer.receiverAccountNumber}</h3>
          <h4 className="text-l font-bold text-gray-800">Date: {formatDateTime(transfer.transferDate)}</h4>

        </div>

        <h3 className="text-2xl font-semibold text-blue-500 mb-4">{transfer.amount} TL</h3>

        <div className="border-t border-gray-200 mb-4"></div>

        <div className="flex justify-end">
          <Link
            to={`/editTransfer/${transfer.id}`}
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleTransfer;
