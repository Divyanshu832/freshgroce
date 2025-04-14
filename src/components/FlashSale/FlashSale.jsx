import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHotjar, FaBolt, FaTrash } from "react-icons/fa";
import { BsCartPlus } from "react-icons/bs";
import { toast } from "react-toastify";
import { getFlashSalesCount } from "../../appwrite/databaseUtils";
import { addToCart, deleteFromCart } from "../../redux/cartSlice";
import myContext from "../../context/data/myContext";

function FlashSale() {
  const context = useContext(myContext);
  const { mode } = context;

  const dispatch = useDispatch();
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartItems = useSelector((state) => state.cart); // Get cart items from Redux store

  // Check if an item is already in the cart
  const isItemInCart = (itemId) => {
    return cartItems.some((item) => item.$id === itemId);
  };

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const response = await getFlashSalesCount(4); // Limit to 4 items
        if (response.success) {
          setFlashSales(response.data);
        } else {
          console.error("Failed to fetch flash sales:", response.error);
        }
      } catch (error) {
        console.error("Error fetching flash sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        ...item,
        quantity: 1,
        isFlashSale: true, // Flag this as a flash sale item
      })
    );
    toast.success("Added to cart!");
  };

  // Handle removing item from cart
  const handleRemoveFromCart = (item) => {
    dispatch(deleteFromCart(item));
    toast.error("Removed from cart");
  };

  // If no flash sales are available, don't render the component
  if (!loading && flashSales.length === 0) {
    return null;
  }

  return (
    <div className="w-full pt-8 md:py-16 bg-gradient-to-b from-purple-200 to-purple-50 dark:from-purple-900/30 dark:to-transparent">
      {/* Flash Sale Header - with original layout */}
      <div className="w-full mb-6 lg:mb-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaHotjar className="text-red-500 text-2xl mr-2" />
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: mode === "dark" ? "white" : "black" }}
            >
              Flash Sale
            </h2>
          </div>
          <div className="flex items-center text-white bg-purple-700 p-2 rounded-md">
            <FaBolt className="text-yellow-400 text-xl" />
            <span
              className="ml-1 text-sm"
            >
              Limited time offer
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
          {flashSales.map((item) => (
            <div
              key={item.$id}
              className="group relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-gray-100 hover:shadow-2xl drop-shadow-lg"
              style={{
                backgroundColor: mode === "dark" ? "#1e293b" : "white",
                borderColor: mode === "dark" ? "#4B5563" : "#E5E7EB",
              }}
            >
              {/* Sale Badge */}
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
                <FaBolt className="mr-1" />
                SALE
              </div>

              {/* Product Image */}
              <div className="h-48 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-2xl p-2 hover:scale-110 transition-all duration-300 ease-in-out"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3
                  className="text-lg font-semibold mb-1 truncate"
                  style={{ color: mode === "dark" ? "white" : "black" }}
                >
                  {item.title}
                </h3>

                <p className="text-red-600 font-bold mb-2">₹{item.price}</p>

                <p
                  className="text-sm mb-3 line-clamp-2"
                  style={{ color: mode === "dark" ? "#9CA3AF" : "#6B7280" }}
                >
                  {item.description}
                </p>

                {isItemInCart(item.$id) ? (
                  <>
                    <button
                      onClick={() => handleRemoveFromCart(item)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaTrash className="mr-2" />
                      Remove from Cart
                    </button>
                    <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                      Only one unit allowed
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <BsCartPlus className="mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashSale;
