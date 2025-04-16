import React, { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  OrderStatus,
} from "../../../appwrite/databaseUtils";
import {
  downloadInvoice,
  generateAndStoreInvoice,
} from "../../../appwrite/invoiceUtils";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaShippingFast,
  FaBoxOpen,
  FaTimes,
  FaTrash,
  FaFileInvoice,
  FaSpinner,
} from "react-icons/fa";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (selectedOrderId === orderId && isConfirmingDelete) {
      try {
        const result = await deleteOrder(orderId);
        if (result.success) {
          toast.success("Order deleted successfully");
          fetchOrders(); // Refresh orders list
        } else {
          toast.error(result.error || "Failed to delete order");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("An error occurred while deleting the order");
      } finally {
        setIsConfirmingDelete(false);
        setSelectedOrderId(null);
      }
    } else {
      setSelectedOrderId(orderId);
      setIsConfirmingDelete(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setIsConfirmingDelete(false);
        setSelectedOrderId(null);
      }, 3000);
    }
  };

  // Function to get appropriate status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "pending":
        return "bg-yellow-200 text-yellow-800"; // Yellow for pending
      case "Confirmed":
      case "confirmed":
        return "bg-blue-200 text-blue-800"; // Blue for confirmed
      case "Delivered":
      case "delivered":
        return "bg-green-200 text-green-800"; // Green for delivered
      case "Cancelled":
      case "cancelled":
        return "bg-red-200 text-red-800"; // Red for cancelled
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Calculate total order amount
  const getTotalAmount = (order) => {
    let total = 0;
    if (order.totalAmount) {
      return order.totalAmount;
    }
    if (order.cartItems && Array.isArray(order.cartItems)) {
      total = order.cartItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
    }
    return total.toFixed(2);
  };

  // Parse address data to get customer name
  const getCustomerName = (order) => {
    if (order.addressInfo?.name) {
      return order.addressInfo.name;
    }

    // Try to parse address string if it exists
    if (order.address && typeof order.address === "string") {
      try {
        const addressData = JSON.parse(order.address);
        return addressData.name || "N/A";
      } catch (e) {
        console.error("Error parsing address data:", e);
        return "N/A";
      }
    }

    return "N/A";
  };

  // Get customer area from address
  const getCustomerArea = (order) => {
    if (order.addressInfo?.area) {
      return order.addressInfo.area;
    }

    // Try to parse address string if it exists
    if (order.address && typeof order.address === "string") {
      try {
        const addressData = JSON.parse(order.address);

        // Get the area field directly
        if (addressData.area) {
          return addressData.area;
        }

        return "N/A";
      } catch (e) {
        console.error("Error parsing address data for area:", e);
        return "N/A";
      }
    }

    return "N/A";
  };

  // Parse address data to get complete address
  const getCustomerFullAddress = (order) => {
    if (order.addressInfo?.address) {
      return order.addressInfo.address;
    }

    // Try to parse address string if it exists
    if (order.address && typeof order.address === "string") {
      try {
        const addressData = JSON.parse(order.address);
        return addressData.address || "N/A";
      } catch (e) {
        console.error("Error parsing address data:", e);
        return "N/A";
      }
    }

    return "N/A";
  };

  // Format the date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Order ID</th>
                <th className="py-2 px-3 text-left">User ID</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-left">Address</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Amount</th>
                <th className="py-2 px-3 text-left">Payment</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Area</th>
                <th className="py-2 px-3 text-left">Invoice</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.$id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="py-2 px-3">
                    <div className="font-medium">
                      {order.$id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="py-2 px-3">{order.userId || "N/A"}</td>
                  <td className="py-2 px-3">
                    <div>{getCustomerName(order)}</div>
                    <div className="text-xs">
                      {order.phoneNumber || "No phone"}
                    </div>
                  </td>
                  <td className="py-2 px-3">{getCustomerFullAddress(order)}</td>
                  <td className="py-2 px-3">
                    {order.date || formatDate(order.$createdAt)}
                  </td>
                  <td className="py-2 px-3">${getTotalAmount(order)}</td>
                  <td className="py-2 px-3">{order.paymentMethod || "N/A"}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td className="py-2 px-3">{getCustomerArea(order)}</td>
                  <td className="py-2 px-3">
                    {order.invoiceId ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            downloadInvoice(order.invoiceId, order.$id)
                          }
                          className="flex items-center text-xs text-green-600 hover:text-green-800"
                          title="Download Invoice"
                        >
                          <FaFileInvoice className="mr-1" /> Download
                        </button>
                        <span
                          className="text-xs text-gray-500 mt-1"
                          title={`Invoice ID: ${order.invoiceId}`}
                        >
                          Invoice: #{order.invoiceId.substring(0, 8)}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setGeneratingInvoiceId(order.$id);
                          generateAndStoreInvoice(order)
                            .then((result) => {
                              if (result.success) {
                                toast.success("Invoice generated successfully");
                                fetchOrders(); // Refresh orders to show new invoice URL
                              } else {
                                toast.error("Failed to generate invoice");
                              }
                            })
                            .catch((error) => {
                              console.error("Error generating invoice:", error);
                              toast.error("Failed to generate invoice");
                            })
                            .finally(() => {
                              setGeneratingInvoiceId(null);
                            });
                        }}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                        title="Generate Invoice"
                        disabled={generatingInvoiceId === order.$id}
                      >
                        {generatingInvoiceId === order.$id ? (
                          <FaSpinner className="mr-1 animate-spin" />
                        ) : (
                          <FaFileInvoice className="mr-1" />
                        )}
                        Generate
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex space-x-2">
                      {/* Confirm button */}
                      <button
                        onClick={() =>
                          handleStatusUpdate(order.$id, OrderStatus.CONFIRMED)
                        }
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Confirm Order"
                      >
                        <FaCheck />
                      </button>

                      {/* Deliver button */}
                      <button
                        onClick={() =>
                          handleStatusUpdate(order.$id, OrderStatus.DELIVERED)
                        }
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Mark as Delivered"
                      >
                        <FaBoxOpen />
                      </button>

                      {/* Cancel button */}
                      <button
                        onClick={() =>
                          handleStatusUpdate(order.$id, OrderStatus.CANCELLED)
                        }
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Cancel Order"
                      >
                        <FaTimes />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteOrder(order.$id)}
                        className={`p-1 rounded ${
                          selectedOrderId === order.$id && isConfirmingDelete
                            ? "bg-red-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        title={
                          selectedOrderId === order.$id && isConfirmingDelete
                            ? "Click again to confirm delete"
                            : "Delete Order"
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
