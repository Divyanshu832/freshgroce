import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  memo,
  useCallback,
} from "react";
import myContext from "../../context/data/myContext";
import Layout from "../../components/layout/layout";
import Modal from "../../components/modal/Modal";
import OrderSuccess from "../../components/OrderSuccess/OrderSuccess";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseCart,
  deleteFromCart,
  clearCart,
} from "../../redux/cartSlice";
import { addOrderToDb, OrderStatus } from "../../appwrite/databaseUtils";
import { generateAndStoreInvoice } from "../../appwrite/invoiceUtils";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

// Memoized cart item component for better performance
const CartItem = memo(
  ({ item, mode, decreaseQuantity, increaseQuantity, removeFromCart }) => {
    const { title, price, imageUrl, description, quantity } = item;

    return (
      <div
        className="justify-between mb-6 rounded-lg border drop-shadow-xl bg-white p-6 sm:flex sm:justify-start"
        style={{
          backgroundColor: mode === "dark" ? "rgb(32 33 34)" : "",
          color: mode === "dark" ? "white" : "",
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full rounded-lg sm:w-40"
          loading="lazy"
          width="160"
          height="160"
        />
        <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
          <div className="mt-5 sm:mt-0">
            <h2
              className="text-lg font-bold text-gray-900"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              {title}
            </h2>
            <h2
              className="text-sm text-gray-900"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              {description}
            </h2>
            <p
              className="mt-1 text-xs font-semibold text-gray-700"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              ₹{price} × {quantity} = ₹{parseInt(price) * quantity}
            </p>
          </div>
          <div className="mt-4 flex flex-col justify-between sm:mt-0 sm:space-y-6 sm:block">
            <div className="flex items-center justify-end space-x-4 mb-2">
              <button
                onClick={() => decreaseQuantity(item)}
                className="bg-green-100 text-green-800 p-1 rounded hover:bg-green-200"
              >
                <FaMinus size={12} />
              </button>
              <span className="text-center font-semibold">{quantity}</span>
              <button
                onClick={() => increaseQuantity(item)}
                className="bg-green-100 text-green-800 p-1 rounded hover:bg-green-200"
              >
                <FaPlus size={12} />
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item)}
              className="text-red-500 hover:text-red-700 flex items-center justify-end"
            >
              <FaTrash className="mr-1" /> Remove
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CartItem.displayName = "CartItem";

function Cart() {
  const context = useContext(myContext);
  const { mode } = context;

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const [totalAmount, setTotalAmount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [area, setArea] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  // Memoize calculations that don't need to be recalculated on every render
  const { shipping, grandTotal } = useMemo(() => {
    let calculatedTotal = 0;
    if (cartItems.length > 0) {
      calculatedTotal = cartItems.reduce(
        (sum, item) => sum + parseInt(item.price) * item.quantity,
        0
      );
    }
    const calculatedShipping =
      cartItems.length === 0 ? 0 : calculatedTotal >= 99 ? 0 : 25;
    return {
      shipping: calculatedShipping,
      grandTotal: calculatedShipping + calculatedTotal,
    };
  }, [cartItems]);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + parseInt(item.price) * item.quantity,
      0
    );
    setTotalAmount(total);

    // Persist cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Memoize handlers to prevent unnecessary re-renders
  const increaseQuantity = useCallback(
    (item) => {
      dispatch(addToCart(item));
    },
    [dispatch]
  );

  const decreaseQuantity = useCallback(
    (item) => {
      dispatch(decreaseCart(item));
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    (item) => {
      dispatch(deleteFromCart(item));
      toast.error("Item removed from cart");
    },
    [dispatch]
  );

  const placeOrder = async () => {
    // validation
    if (
      name === "" ||
      address === "" ||
      pincode === "" ||
      phoneNumber === "" ||
      paymentMethod === "" ||
      area === ""
    ) {
      return toast.error("All fields are required", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }

    // Check if user is logged in by verifying localStorage
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (!userInfo || !userInfo.user || !userInfo.user.uid) {
      toast.error("Please log in to place an order", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Set processing state to true - this will show the loading indicator
    setIsProcessing(true);

    const addressInfo = {
      name,
      address,
      pincode,
      phoneNumber,
      area,
      timeSlot,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    // store order in Appwrite with guaranteed userId
    const orderInfo = {
      items: JSON.stringify(cartItems),
      address: JSON.stringify(addressInfo),
      orderDate: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      phoneNumber: userInfo.user.phoneNumber || phoneNumber,
      userId: userInfo.user.uid,
      status: OrderStatus.PENDING,
      totalAmount: grandTotal,
      paymentMethod: paymentMethod,
      timeSlot: timeSlot,
    };

    try {
      const response = await addOrderToDb(orderInfo);
      if (response.success) {
        // Generate and store invoice asynchronously
        const orderWithId = {
          ...orderInfo,
          $id: response.data.$id,
        };

        // Don't await invoice generation - do it in background
        generateAndStoreInvoice(orderWithId).catch((error) =>
          console.error("Error generating invoice:", error)
        );

        // Set processing to false
        setIsProcessing(false);
        setShowSuccessModal(true);
        dispatch(clearCart());
        localStorage.removeItem("cart");
      } else {
        setIsProcessing(false);
        toast.error(response.error || "Failed to place order");
      }
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      toast.error("An error occurred");
    }
  };

  // Close the success modal and redirect to home
  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    window.location.href = "/";
  }, []);

  return (
    <Layout>
      <div
        className="h-full bg-gray-100 pt-5 md:pb-20 pb-10"
        style={{
          backgroundColor: mode === "dark" ? "#282c34" : "",
          color: mode === "dark" ? "white" : "",
        }}
      >
        <h1 className="mb-10 text-center text-2xl font-bold">Cart Items</h1>
        <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
          <div className="rounded-lg md:w-2/3">
            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-2">
                  Your cart is empty
                </h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
              </div>
            ) : (
              <div>
                {cartItems.map((item, index) => (
                  <CartItem
                    key={`${item.$id || item.id}_${index}`}
                    item={item}
                    mode={mode}
                    decreaseQuantity={decreaseQuantity}
                    increaseQuantity={increaseQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className="mt-6 h-full rounded-lg border bg-white p-6 shadow-md md:mt-0 md:w-1/3"
            style={{
              backgroundColor: mode === "dark" ? "rgb(32 33 34)" : "",
              color: mode === "dark" ? "white" : "",
            }}
          >
            <div className="mb-2 flex justify-between">
              <p
                className="text-gray-700"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                Subtotal
              </p>
              <p
                className="text-gray-700"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                ₹{totalAmount}
              </p>
            </div>
            <div className="flex justify-between">
              <p
                className="text-gray-700"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                Shipping
              </p>
              <p
                className="text-gray-700"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                ₹{shipping}
              </p>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-3">
              <p
                className="text-lg font-bold"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                Total
              </p>
              <div>
                <p
                  className="mb-1 text-lg font-bold"
                  style={{ color: mode === "dark" ? "white" : "" }}
                >
                  ₹{grandTotal}
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <>
                <Modal
                  name={name}
                  address={address}
                  pincode={pincode}
                  phoneNumber={phoneNumber}
                  setName={setName}
                  setAddress={setAddress}
                  setPincode={setPincode}
                  setPhoneNumber={setPhoneNumber}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  area={area}
                  setArea={setArea}
                  timeSlot={timeSlot}
                  setTimeSlot={setTimeSlot}
                  buyNow={placeOrder}
                  isProcessing={isProcessing}
                />
                <div className="mt-3 text-center">
                  <p className="text-sm text-green-600 font-medium">
                    We will deliver your order tomorrow from 6AM - 9AM
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      <OrderSuccess isOpen={showSuccessModal} closeModal={closeSuccessModal} />
    </Layout>
  );
}

export default Cart;
