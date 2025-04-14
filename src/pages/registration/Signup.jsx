import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import myContext from "../../context/data/myContext";
import { toast } from "react-toastify";
import { signInWithGoogle, isAuthenticated } from "../../appwrite/authUtils";
import Loader from "../../components/loader/loader";

function Signup() {
  const navigate = useNavigate();
  const context = useContext(myContext);
  const { loading, setLoading } = context;
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true);
      setIsAuthenticating(true);
      try {
        const authStatus = await isAuthenticated();
        if (authStatus.success && authStatus.isAuthenticated) {
          // User is already authenticated, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setLoading(false);
        setIsAuthenticating(false);
      }
    };

    checkUserStatus();
  }, [navigate, setLoading]);

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // The OAuth process will redirect to success URL after authentication
      // Upon return, the useEffect in Login component will handle user creation in database
    } catch (error) {
      console.error(error);
      toast.error("Signup Failed", {
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

  // If still checking authentication status, show loader
  if (isAuthenticating) {
    return <Loader />;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      {loading && <Loader />}
      <div className="bg-gray-800 px-10 py-10 rounded-xl">
        <div className="">
          <h1 className="text-center text-white text-xl mb-4 font-bold">
            Signup
          </h1>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleGoogleSignUp}
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

        <div>
          <h2 className="text-white">
            Have an account{" "}
            <Link className="text-red-500 font-bold" to={"/login"}>
              Login
            </Link>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Signup;
