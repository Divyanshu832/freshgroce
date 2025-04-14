import React, { useContext, useEffect } from "react";
import myContext from "../../context/data/myContext";
import Layout from "../../components/layout/layout";
import Loader from "../../components/loader/loader";
import { toast } from "react-toastify";
import {
  downloadInvoice,
  generateAndStoreInvoice,
} from "../../appwrite/invoiceUtils";
import {
  FaShoppingBag,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaFileInvoice,
  FaDownload,
} from "react-icons/fa";

function Order() {
  const userid = JSON.parse(localStorage.getItem("user")).user.uid;
  const context = useContext(myContext);
  const { mode, loading, order, refreshOrderData } = context;

  // Set up polling to refresh order data every 5 seconds
  useEffect(() => {
    // Initial refresh
    refreshOrderData();

    // Set up interval for polling
    const intervalId = setInterval(() => {
      refreshOrderData();
    }, 5000); // Poll every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  // Get status badge and icon based on order status
  const getStatusBadge = (status) => {
    let badgeClass = "bg-yellow-100 text-yellow-800"; // Yellow for pending (default)
    let icon = <FaShoppingBag className="mr-1" />;

    if (status === "Confirmed" || status === "confirmed") {
      badgeClass = "bg-blue-100 text-blue-800"; // Blue for confirmed (changed from yellow to blue)
      icon = <FaShoppingBag className="mr-1" />;
    } else if (status === "Delivered" || status === "delivered") {
      badgeClass = "bg-green-100 text-green-800"; // Green for delivered
      icon = <FaCheckCircle className="mr-1" />;
    } else if (status === "Cancelled" || status === "cancelled") {
      badgeClass = "bg-red-100 text-red-800"; // Red for cancelled
      icon = <FaTimesCircle className="mr-1" />;
    }

    return (
      <span
        className={`flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeClass}`}
      >
        {icon}
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  return (
    <Layout>
      {loading && <Loader />}
      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: mode === "dark" ? "white" : "" }}
        >
          My Orders
        </h1>

        {order.length > 0 ? (
          <div className="space-y-8">
            {order
              .filter((obj) => obj.userId === userid)
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Show newest orders first
              .map((order, orderIndex) => (
                <div
                  key={orderIndex}
                  className="border rounded-lg overflow-hidden shadow-md"
                  style={{
                    backgroundColor: mode === "dark" ? "#282c34" : "white",
                    color: mode === "dark" ? "white" : "",
                  }}
                >
                  <div
                    className="p-4 bg-gray-50 border-b flex justify-between items-center"
                    style={{
                      backgroundColor: mode === "dark" ? "#1F2937" : "",
                      color: mode === "dark" ? "white" : "",
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Order ID:{" "}
                        <span className="font-normal">
                          {order.$id?.substring(0, 8)}
                        </span>
                      </p>
                      <p className="text-sm">
                        Date:{" "}
                        <span className="font-semibold">
                          {formatDate(order.date)}
                        </span>
                      </p>
                      <p className="text-sm">
                        Total:{" "}
                        <span className="font-semibold">
                          ₹{order.totalAmount}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="mb-2">{getStatusBadge(order.status)}</div>

                      {/* Invoice - Only show download option for delivered orders */}
                      {order.invoiceId &&
                      (order.status === "Delivered" ||
                        order.status === "delivered") ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() =>
                              downloadInvoice(order.invoiceId, order.$id)
                            }
                            className="flex items-center text-xs text-green-600 cursor-pointer hover:underline mt-1"
                          >
                            <FaFileInvoice className="mr-1" />
                            Download Invoice
                          </button>
                          <span className="text-xs text-gray-500 mt-1">
                            Invoice: #{order.invoiceId.substring(0, 8)}
                          </span>
                        </div>
                      ) : null}

                      {order.status === "shipped" && (
                        <div className="text-xs text-blue-500 cursor-pointer hover:underline mt-1">
                          Track Package
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="divide-y">
                    {order.cartItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex p-4">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3
                            className="text-lg font-medium"
                            style={{
                              color: mode === "dark" ? "white" : "black",
                            }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm text-gray-500"
                            style={{ color: mode === "dark" ? "#D1D5DB" : "" }}
                          >
                            {item.description?.substring(0, 100)}...
                          </p>
                          <div className="mt-2 flex justify-between">
                            <p
                              className="text-sm font-medium"
                              style={{
                                color: mode === "dark" ? "#D1D5DB" : "",
                              }}
                            >
                              Quantity: {item.quantity}
                            </p>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color: mode === "dark" ? "#D1D5DB" : "",
                              }}
                            >
                              ₹{item.price} per item
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-4 bg-gray-50 border-t"
                    style={{
                      backgroundColor: mode === "dark" ? "#1F2937" : "",
                      color: mode === "dark" ? "white" : "",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">
                          Shipping Address:
                          <span className="ml-1 font-normal">
                            {order.addressInfo?.address},{" "}
                            {order.addressInfo?.pincode}
                          </span>
                        </p>
                        <p className="text-sm">
                          Contact:
                          <span className="ml-1 font-normal">
                            {order.addressInfo?.phoneNumber ||
                              order.phoneNumber}
                          </span>
                        </p>
                        <p className="text-sm">
                          Payment Method:
                          <span className="ml-1 font-normal">
                            {order.paymentMethod || "N/A"}
                          </span>
                        </p>
                      </div>

                      {/* Order tracking progress bar */}
                      <div className="hidden md:block w-64">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div
                              className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                order.status === "cancelled"
                                  ? "text-red-600 bg-red-200"
                                  : "text-blue-600 bg-blue-200"
                              }`}
                            >
                              {order.status === "cancelled"
                                ? "Cancelled"
                                : "Progress"}
                            </div>
                          </div>

                          {order.status === "cancelled" ||
                          order.status === "Cancelled" ? (
                            // Red broken bar for cancelled orders
                            <div className="flex h-2 mb-4 overflow-hidden text-xs bg-red-100 rounded relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full border-t-2 border-red-500 border-dashed"></div>
                              </div>
                              <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 w-full opacity-30"></div>
                            </div>
                          ) : (
                            // Normal progress bar with 3 stages and different colors
                            <div className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded">
                              {/* Dynamic colored progress bar based on status */}
                              <div
                                style={{
                                  width:
                                    order.status === "Pending" ||
                                    order.status === "pending"
                                      ? "33%"
                                      : order.status === "Confirmed" ||
                                        order.status === "confirmed"
                                      ? "66%"
                                      : order.status === "Delivered" ||
                                        order.status === "delivered"
                                      ? "100%"
                                      : "0%",
                                  backgroundColor:
                                    order.status === "Pending" ||
                                    order.status === "pending"
                                      ? "#FBBF24" // Yellow for Pending (changed from blue)
                                      : order.status === "Confirmed" ||
                                        order.status === "confirmed"
                                      ? "#3B82F6" // Blue for Confirmed (changed from yellow)
                                      : order.status === "Delivered" ||
                                        order.status === "delivered"
                                      ? "#10B981" // Green for Delivered
                                      : "#FBBF24", // Default yellow
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                              ></div>
                            </div>
                          )}

                          <div className="flex text-xs justify-between">
                            <span>Pending</span>
                            <span>Confirmed</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2
              className="mt-4 text-lg font-medium text-gray-900"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              No orders found
            </h2>
            <p
              className="mt-2 text-sm text-gray-500"
              style={{ color: mode === "dark" ? "#D1D5DB" : "" }}
            >
              You haven't placed any orders yet.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Order;
