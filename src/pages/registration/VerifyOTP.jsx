import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyEmailOTP, synchronizeUserState } from "../../appwrite/authUtils";
import Loader from "../../components/loader/loader";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    inProgress: true,
    success: false,
    error: null,
  });

  useEffect(() => {
    async function verifyOTP() {
      // Clear any existing localStorage data to ensure clean state
      localStorage.clear();

      // Extract userId and secret from URL parameters
      const searchParams = new URLSearchParams(location.search);
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (!userId || !secret) {
        setVerificationStatus({
          inProgress: false,
          success: false,
          error: "Invalid verification link. Missing parameters.",
        });
        setLoading(false);
        return;
      }

      try {
        const result = await verifyEmailOTP(userId, secret);

        if (result.success) {
          // Force synchronize user state including admin status
          try {
            const syncResult = await synchronizeUserState();
            console.log(
              "Auth state synchronized after OTP verification:",
              syncResult
            );
          } catch (syncError) {
            console.error("Error synchronizing auth state:", syncError);
          }

          setVerificationStatus({
            inProgress: false,
            success: true,
            error: null,
          });

          // Short delay to show success message before redirecting
          setTimeout(() => {
            toast.success("Login successful!");
            navigate("/");
          }, 2000);
        } else {
          setVerificationStatus({
            inProgress: false,
            success: false,
            error: result.message || "Verification failed. Please try again.",
          });
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setVerificationStatus({
          inProgress: false,
          success: false,
          error: error.message || "An error occurred during verification.",
        });
      } finally {
        setLoading(false);
      }
    }

    verifyOTP();
  }, [location.search, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Email Verification
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="text-center">
            {verificationStatus.inProgress ? (
              <p className="text-gray-600">Verifying your login...</p>
            ) : verificationStatus.success ? (
              <div className="text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-xl font-medium mt-2">
                  Verification Successful!
                </p>
                <p className="mt-2">
                  You are now logged in. Redirecting to home page...
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-xl font-medium mt-2">Verification Failed</p>
                <p className="mt-2">{verificationStatus.error}</p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyOTP;
