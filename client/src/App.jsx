import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Trash2, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fileflow-bp10.onrender.com';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, converting, success, error
  const [progressText, setProgressText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setStatus('idle');
      setErrorMsg('');
    } else {
      setErrorMsg('Please upload a valid PDF file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
  };

  const convertFile = async () => {
    if (!file) return;

    setStatus('converting');
    setProgressText('Uploading PDF...');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('pdf', file);
    
    const forceOcrCheckbox = document.getElementById('forceOcr');
    if (forceOcrCheckbox && forceOcrCheckbox.checked) {
      formData.append('forceOcr', 'true');
    }

    try {
      // Step 1: Upload and wait for conversion
      setProgressText('Analyzing PDF & Extracting Text...');
      
      const response = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setStatus('success');
        setResultData(response.data);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(
        err.response?.data?.error || err.message || 'An unexpected error occurred during conversion.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Hindi PDF to Word Converter
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Convert Hindi PDFs into editable Word documents, supporting both standard and scanned files.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            
            {/* Upload Area */}
            {status === 'idle' && !file && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  <span className="font-medium text-indigo-600">Click to browse</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">PDF files up to 50MB</p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700">{errorMsg}</p>
              </div>
            )}

            {/* Selected File Area */}
            {file && status === 'idle' && (
              <div className="border rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <File className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</h3>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                  <label className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer mb-4 sm:mb-0">
                    <input 
                      type="checkbox" 
                      id="forceOcr" 
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150 ease-in-out" 
                    />
                    <span>Force OCR (Fixes mixed English/Hindi Kruti Dev text)</span>
                  </label>
                  <button
                    onClick={convertFile}
                    className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                  >
                    Convert to Word
                  </button>
                </div>
              </div>
            )}

            {/* Converting State */}
            {status === 'converting' && (
              <div className="text-center py-12">
                <RefreshCw className="h-16 w-16 text-indigo-600 mx-auto animate-spin mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Converting Document</h3>
                <p className="text-indigo-600 font-medium">{progressText}</p>
                <p className="mt-2 text-sm text-gray-500">This may take a few minutes for scanned PDFs.</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && resultData && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                  <FileText className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversion Complete!</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original File:</span>
                      <span className="font-medium text-gray-900 truncate ml-4">{resultData.originalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pages Processed:</span>
                      <span className="font-medium text-gray-900">{resultData.pagesProcessed || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document Type:</span>
                      <span className="font-medium text-gray-900">
                        {resultData.isScanned ? 'Scanned PDF (OCR applied)' : 'Standard PDF'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                {resultData.extractedText && (
                  <div className="mb-8 text-left max-w-2xl mx-auto border rounded-lg overflow-hidden bg-white shadow-inner">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                      <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
                    </div>
                    <div className="p-4 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed">
                      {resultData.extractedText}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`${API_BASE_URL}${resultData.downloadUrl}`}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm"
                  >
                    Download DOCX
                  </a>
                  <button
                    onClick={() => {
                      setFile(null);
                      setStatus('idle');
                    }}
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                  >
                    Convert Another File
                  </button>
                </div>
              </div>
            )}
            
            {/* Error State Retry */}
            {status === 'error' && (
               <div className="mt-6 flex justify-center">
                 <button
                   onClick={() => setStatus('idle')}
                   className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                 >
                   Try Again
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
