import { useState, useRef } from 'react';
import { useFinance } from '../hooks/useFinance';

function ReceiptScanner({ onScanComplete }) {
  const { addExpense } = useFinance();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(selectedFile.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };
  
  const handleScan = async () => {
    if (!file) return;
    
    setScanning(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an OCR service
      // For demo purposes, we'll simulate a successful scan with mock data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Mock scanned data
      const mockScannedData = {
        merchant: 'Grocery Store',
        date: new Date().toISOString().split('T')[0],
        total: (Math.random() * 100).toFixed(2),
        items: [
          { description: 'Milk', amount: (Math.random() * 5).toFixed(2) },
          { description: 'Bread', amount: (Math.random() * 4).toFixed(2) },
          { description: 'Eggs', amount: (Math.random() * 6).toFixed(2) },
        ]
      };
      
      setScannedData(mockScannedData);
    } catch (err) {
      setError('Failed to scan receipt. Please try again.');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };
  
  const handleCreateExpense = async () => {
    if (!scannedData) return;
    
    try {
      // Create expense from scanned data
      const expenseData = {
        description: scannedData.merchant,
        amount: scannedData.total,
        date: scannedData.date,
        type: 'expense',
        receipt: file,
        notes: `Scanned receipt items:\n${scannedData.items.map(item => `- ${item.description}: $${item.amount}`).join('\n')}`
      };
      
      const newExpense = await addExpense(expenseData);
      
      // Reset scanner
      setFile(null);
      setPreview(null);
      setScannedData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      if (onScanComplete) {
        onScanComplete(newExpense);
      }
    } catch (err) {
      setError('Failed to create expense. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receipt Scanner</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {!scannedData ? (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Receipt
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:text-gray-400 dark:file:bg-primary-900 dark:file:text-primary-300"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload a receipt image (JPEG, PNG) or PDF to scan
            </p>
          </div>
          
          {preview && (
            <div className="mb-4">
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="max-h-64 mx-auto border border-gray-200 dark:border-gray-700 rounded-md"
              />
            </div>
          )}
          
          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className={`w-full btn ${!file || scanning ? 'btn-disabled' : 'btn-primary'}`}
          >
            {scanning ? 'Scanning...' : 'Scan Receipt'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Scanned Data</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
                <span className="font-medium text-gray-900 dark:text-white">{scannedData.merchant}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{scannedData.date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${parseFloat(scannedData.total).toFixed(2)}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                <ul className="mt-1 space-y-1">
                  {scannedData.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.description}</span>
                      <span>${parseFloat(item.amount).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setScannedData(null);
                setFile(null);
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="flex-1 btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateExpense}
              className="flex-1 btn btn-primary"
            >
              Create Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiptScanner;
