import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { uploadCandidateImage } from "../../utils/uploadCandidateImage";
import { FaUpload } from "react-icons/fa";
import toast from 'react-hot-toast';

const RegisterCandidate = () => {
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Add loading state
  const [loading, setLoading] = useState(true); // ✅ Full page loading state

  useEffect(() => {
    // Simulate loading state while page initializes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;

  const nameRef = useRef(null);
  const genderRef = useRef(null);
  const partyRef = useRef(null);
  const ageRef = useRef(null);
  const emailRef = useRef(null);

  const handleCandidateRegistration = async (e) => {
    e.preventDefault();
    try {
      // ✅ Set loading state
      setIsSubmitting(true);
      
      const name = nameRef.current.value;
      const age = ageRef.current.value;
      const gender = genderRef.current.value; // This will capture the selected gender
      const party = partyRef.current.value;
      const email = emailRef.current.value;

      if (!contractInstance) {
        throw new Error("Contract instance not found!");
      }

      // Map selected gender to enum value
      const genderEnum = mapGenderToEnum(gender);

      const imageUploadStatus = await uploadCandidateImage(file, email);
      if (imageUploadStatus === true) {
        // Show loading toast
        const toastId = toast.loading('Processing...', {
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '50px',
            padding: '12px 24px',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
          },
        });
        
        await contractInstance.registerCandidate(name, party, age, genderEnum);
        
        // Clear form
        nameRef.current.value = "";
        ageRef.current.value = "";
        genderRef.current.value = "";
        emailRef.current.value = "";
        partyRef.current.value = "";
        setFile(null);
        setFilePreview(null);
        
        // Update to success
        toast.success((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px', animation: 'bounce 0.6s ease-in-out' }}>🏆</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>Candidate Registered!</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Good luck in election</div>
            </div>
          </div>
        ), {
          id: toastId,
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 10px 40px rgba(240, 147, 251, 0.4)',
          },
        });
      } else {
        throw new Error("Image upload failed!");
      }
    } catch (error) {
      console.error("Candidate Registration Error:", error);
      
      // Compact gradient toasts
      if (error.message.includes("already registered")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🚫</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Already Registered</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>One wallet, one candidacy</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(118, 75, 162, 0.35)',
          },
        });
      } else if (error.message.includes("age must be 25")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🔞</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Age Requirement</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Must be 25+</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(250, 112, 154, 0.35)',
          },
        });
      } else if (error.message.includes("user rejected")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⛔</span>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Transaction Cancelled</span>
          </div>
        ), {
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            color: '#fff',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          },
        });
      } else if (error.message.includes("Image upload failed")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📸</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Upload Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Try again</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(118, 75, 162, 0.35)',
          },
        });
      } else {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>❌</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Registration Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Please retry</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(118, 75, 162, 0.35)',
          },
        });
      }
    } finally {
      // ✅ Always reset loading state
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  // Function to map gender input to enum values
  const mapGenderToEnum = (gender) => {
    switch (gender) {
      case "Male":
        return 1; // Assuming Male corresponds to enum value 1
      case "Female":
        return 2; // Assuming Female corresponds to enum value 2
      case "Other":
        return 3; // Assuming Other corresponds to enum value 3
      default:
        return 0; // NotSpecified
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Loading Candidate Registration...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we initialize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-purple-500/10 backdrop-blur-lg px-6 py-2 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-bold">🏆 Candidate Registration</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Register as Candidate
            </span>
          </h1>
          <p className="text-gray-400 font-bold">Join the election and represent your party</p>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <form onSubmit={handleCandidateRegistration} className="space-y-6">
            {/* Candidate Name */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Full Name
              </label>
              <input
                type="text"
                ref={nameRef}
                placeholder="Enter candidate's full name"
                className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Candidate Age */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Age
              </label>
              <input
                type="number"
                ref={ageRef}
                placeholder="Enter age (21+)"
                min="21"
                max="120"
                className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                ref={emailRef}
                placeholder="Enter your email (e.g., candidate@example.com)"
                className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Gender */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-pink-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Gender
              </label>
              <select
                ref={genderRef}
                className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                required
              >
                <option value="" className="bg-gray-800">Select gender</option>
                <option value="Male" className="bg-gray-800">Male</option>
                <option value="Female" className="bg-gray-800">Female</option>
                <option value="Other" className="bg-gray-800">Other</option>
              </select>
            </div>

            {/* Party Name */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Party Name
              </label>
              <input
                type="text"
                ref={partyRef}
                placeholder="Enter party name"
                className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Profile Photo
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FaUpload className="mr-2" /> 
                  <span className="font-semibold">{file ? 'Change Photo' : 'Upload Photo'}</span>
                </label>
              </div>

              {/* Image Preview */}
              {filePreview && (
                <div className="mt-6 flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="relative h-40 w-40 object-cover rounded-2xl border-4 border-gray-700 shadow-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl px-6 py-4 sm:px-8 sm:py-4 w-full sm:w-[95%] lg:w-[90%] mx-auto">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-cyan-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-purple-300 text-lg font-bold mb-2">Candidate Requirements</p>
                  <ul className="text-white text-base space-y-2">
                    <li>• Minimum age requirement: 21 years</li>
                    <li>• Profile photo must be clear and recent</li>
                    <li>• Party affiliation is required</li>
                    <li>• Registration is permanent on blockchain</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
              } text-white font-bold py-4 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center text-lg`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-6 h-6 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Register as Candidate
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm font-bold">
            Already registered? 
            <a href="/candidate-list" className="text-purple-300 hover:text-purple-200 ml-1 font-bold underline">
              View Candidate List
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCandidate;
