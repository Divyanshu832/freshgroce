import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/Home";
import MyState from "./context/data/myData";
import Order from "./pages/Order/Order";
import NoPage from "./pages/nopage/NoPage";
import Cart from "./pages/cart/Cart";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import ProductInfo from "./pages/productinfo/ProductInfo";
import Login from "./pages/registration/Login";
import Signup from "./pages/registration/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddProduct from "./pages/admin/pages/AddProduct";
import UpdateProduct from "./pages/admin/pages/UpdateProduct";
import {
  isUserAdmin,
  isAuthenticated,
  synchronizeUserState,
} from "./appwrite/authUtils";
import AllProducts from "./pages/allproducts/AllProducts";

function App() {
  // Synchronize user state when app first loads
  useEffect(() => {
    const syncUserState = async () => {
      await synchronizeUserState();
    };
    syncUserState();
  }, []);

  return (
    <MyState>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedPublicRoute>
                <Home />
              </ProtectedPublicRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoutes>
                <Order />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoutes>
                <Cart />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutesForAdmin>
                <Dashboard />
              </ProtectedRoutesForAdmin>
            }
          />
          <Route
            path="/productinfo/:id"
            element={
              <ProtectedPublicRoute>
                <ProductInfo />
              </ProtectedPublicRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/addproduct"
            element={
              <ProtectedRoutesForAdmin>
                <AddProduct />
              </ProtectedRoutesForAdmin>
            }
          />
          <Route
            path="/updateproduct"
            element={
              <ProtectedRoutesForAdmin>
                <UpdateProduct />
              </ProtectedRoutesForAdmin>
            }
          />
          <Route
            path="/allproducts"
            element={
              <ProtectedPublicRoute>
                <AllProducts />
              </ProtectedPublicRoute>
            }
          />
          <Route path="/*" element={<NoPage />} />
        </Routes>
        <ToastContainer />
      </Router>
    </MyState>
  );
}

export default App;

// For fully authenticated routes (requires login)
export const ProtectedRoutes = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Always check with Appwrite first for the source of truth
        const authStatus = await isAuthenticated();

        if (authStatus.success && authStatus.isAuthenticated) {
          // Valid session exists, ensure localStorage is updated
          await synchronizeUserState();
          setIsAuth(true);
        } else {
          // No valid session with Appwrite, clear any stale localStorage data
          localStorage.removeItem("user");
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        localStorage.removeItem("user");
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  if (!authChecked) {
    // Show loading state while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (isAuth) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

// For public routes that check auth status but don't require login
export const ProtectedPublicRoute = ({ children }) => {
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check with Appwrite for valid session
        const authStatus = await isAuthenticated();

        if (authStatus.success && authStatus.isAuthenticated) {
          // Valid session exists, synchronize localStorage
          await synchronizeUserState();
        } else {
          // No valid session, clean up any stale data
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error checking auth status on public route:", error);
        localStorage.removeItem("user");
      }
    };

    checkAuthStatus();
  }, []);

  return children;
};

export const ProtectedRoutesForAdmin = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // First check if user is authenticated with server session
      const authStatus = await isAuthenticated();
      if (!authStatus.success || !authStatus.isAuthenticated) {
        setLoading(false);
        return;
      }

      // Check if user is an admin via Appwrite Teams
      try {
        const result = await isUserAdmin();
        setIsAdmin(result.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (isAdmin) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};
