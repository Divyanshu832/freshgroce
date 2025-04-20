import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import myContext from "../../context/data/myContext";
import { toast } from "react-toastify";
import {
  signInWithGoogle,
  isAuthenticated,
  sendEmailOTP,
  createUserWithEmailAndPassword,
} from "../../appwrite/authUtils";
import Loader from "../../components/loader/loader";

function Signup() {
  const navigate = useNavigate();
  const context = useContext(myContext);
  const { loading, setLoading } = context;
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showMagicSignup, setShowMagicSignup] = useState(false);

  useEffect(() => {
    // Clear localStorage when component mounts to prevent "user already exists" errors
    localStorage.clear();

    const checkUserStatus = async () => {
      setIsAuthenticating(true);
      try {
        const authStatus = await isAuthenticated();
        if (authStatus.success && authStatus.isAuthenticated) {
          // User is already logged in, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Clear any existing data before starting OAuth flow
      localStorage.clear();

      await signInWithGoogle();
      // The OAuth flow will handle the redirect and authentication
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Sign up failed", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setLoading(false);
    }
  };

  // Handle Email/Password Signup
  const handleEmailPasswordSignup = async (e) => {
    e.preventDefault();

    // Clear any existing localStorage data that might be causing conflicts
    localStorage.clear();

    // Input validation
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password should be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        email,
        password,
        name
      );

      if (result.success) {
        toast.success("Signup successful");
        navigate("/");
      } else {
        // Clear localStorage again if there's an error
        localStorage.clear();
        toast.error(
          result.error || "Failed to create account. Please try again."
        );
      }
    } catch (error) {
      console.error("Email/password signup error:", error);
      // Clear localStorage again if there's an error
      localStorage.clear();
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email OTP authentication
  const handleEmailOTP = async (e) => {
    e.preventDefault();

    // Clear any existing localStorage data
    localStorage.clear();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmailOTP(email, name);

      if (result.success) {
        setOtpSent(true);
        toast.success(
          "OTP sent to your email. Please check your inbox and spam folders."
        );
      } else {
        // Clear localStorage again if there's an error
        localStorage.clear();
        toast.error(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Email OTP error:", error);
      // Clear localStorage again if there's an error
      localStorage.clear();
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle between password signup and magic link signup
  const toggleSignupMethod = () => {
    // Clear localStorage when switching signup methods
    localStorage.clear();
    setShowMagicSignup(!showMagicSignup);
    setOtpSent(false); // Reset OTP sent state when toggling
  };

  if (isAuthenticating) {
    return <Loader />;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      {loading && <Loader />}
      <div className="bg-gray-800 px-10 py-10 rounded-xl w-screen max-w-md">
        <div className="">
          <h1 className="text-center text-white text-xl mb-4 font-bold">
            Signup
          </h1>
        </div>

        {!showMagicSignup ? (
          // Email/Password Signup Form
          <form onSubmit={handleEmailPasswordSignup} className="mb-6">
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                placeholder="Create a password"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Sign Up
            </button>
          </form>
        ) : (
          // Magic URL Signup Form
          <>
            {!otpSent ? (
              <form onSubmit={handleEmailOTP} className="mb-6">
                <div className="mb-4">
                  <label
                    className="block text-white text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-white text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:border-green-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                >
                  Send Signup Link
                </button>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-green-100 rounded text-green-800 text-center">
                <p>Signup link sent to {email}</p>
                <p className="text-sm mt-2">
                  Please check your email for a signup link
                </p>
                <button
                  onClick={() => setOtpSent(false)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Use different email
                </button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="bg-white w-full text-gray-800 font-bold px-2 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>

        <div className="text-center mt-4 mb-6">
          <button
            type="button"
            onClick={toggleSignupMethod}
            className="text-blue-400 hover:text-blue-500 font-medium"
          >
            {!showMagicSignup ? "Signup with mail OTP" : "Signup with password"}
          </button>
        </div>

        <div>
          <h2 className="text-white">
            Already have an account?{" "}
            <Link className="text-yellow-500 font-bold" to={"/login"}>
              Login
            </Link>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Signup;
