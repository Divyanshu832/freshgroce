import React, { useState, useEffect, useContext } from "react";
import { FaBolt, FaTrash, FaEdit, FaTag } from "react-icons/fa";
import { toast } from "react-toastify";
import myContext from "../../../context/data/myContext";
import {
  getAllFlashSales,
  getAllProducts,
  addFlashSaleToDb,
  updateFlashSaleInDb,
  deleteFlashSaleFromDb,
} from "../../../appwrite/databaseUtils";

function FlashSaleTab() {
  const context = useContext(myContext);
  const { mode } = context;

  const [products, setProducts] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const response = await getAllFlashSales();
      if (response.success) {
        setFlashSales(response.data);
      } else {
        toast.error("Failed to load flash sales");
      }
    } catch (error) {
      console.error("Error fetching flash sales:", error);
      toast.error("Failed to load flash sales");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);

    if (productId) {
      // Find the selected product
      const selectedProduct = products.find(
        (product) => product.$id === productId
      );
      if (selectedProduct) {
        // Check if this product already has a flash sale
        const existingFlashSale = flashSales.find(
          (sale) => sale.title === selectedProduct.title
        );

        if (existingFlashSale && !editingId) {
          toast.warning(
            "This product already has a flash sale. Please choose a different product."
          );
          setSelectedProduct("");
          return;
        }

        // Pre-fill only title, description, and imageUrl (not price)
        setTitle(selectedProduct.title);
        setDescription(selectedProduct.description);
        setImageUrl(selectedProduct.imageUrl);
        // Don't set price - leave it for manual entry
        setPrice("");
      }
    } else {
      // Reset form if no product is selected
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!price || price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    // If we're creating a new flash sale (not editing), check the limit
    if (!editingId && flashSales.length >= 4) {
      toast.warning(
        "Maximum of 4 flash sales allowed. Please delete an existing flash sale first."
      );
      return;
    }

    setLoading(true);

    const flashSaleData = {
      title,
      description,
      price: String(price), // Ensure price is passed as a string
      imageUrl,
      date: new Date().toLocaleDateString(),
    };

    try {
      let response;

      if (editingId) {
        response = await updateFlashSaleInDb(editingId, flashSaleData);
        if (response.success) {
          toast.success("Flash sale updated successfully");
          resetForm();
          fetchFlashSales();
        } else {
          toast.error(response.error || "Failed to update flash sale");
        }
      } else {
        response = await addFlashSaleToDb(flashSaleData);
        if (response.success) {
          toast.success("Flash sale added successfully");
          resetForm();
          fetchFlashSales();
        } else {
          toast.error(response.error || "Failed to add flash sale");
        }
      }
    } catch (error) {
      console.error("Error saving flash sale:", error);
      toast.error("Error saving flash sale");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (flashSale) => {
    setEditingId(flashSale.$id);
    setTitle(flashSale.title || "");
    setDescription(flashSale.description || "");
    setPrice(flashSale.price || "");
    setImageUrl(flashSale.imageUrl || "");
    setSelectedProduct(""); // Clear product selection when editing
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      setLoading(true);
      try {
        const response = await deleteFlashSaleFromDb(id);
        if (response.success) {
          toast.success("Flash sale deleted successfully");
          fetchFlashSales();
        } else {
          toast.error(response.error || "Failed to delete flash sale");
        }
      } catch (error) {
        console.error("Error deleting flash sale:", error);
        toast.error("Error deleting flash sale");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setEditingId(null);
    setSelectedProduct("");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
          <FaBolt className="text-yellow-500 mr-2" />
          {editingId ? "Edit Flash Sale" : "Create Flash Sale"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!editingId && (
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                  Quick Fill from Product (Optional)
                </label>
                <select
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                  value={selectedProduct}
                  onChange={handleProductSelect}
                >
                  <option value="">Select a product to auto-fill fields</option>
                  {products.map((product) => (
                    <option key={product.$id} value={product.$id}>
                      {product.title} - ₹{product.price}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <FaTag className="inline mr-1" /> Only title, description, and
                  image will be auto-filled.
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Title *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Flash Sale Title"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Sale Price * <span className="text-red-500 font-bold">★</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="Enter discounted price"
              />
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                Enter the sale price manually for the flash sale
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Flash Sale Description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Image URL
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-2 p-2 border rounded dark:border-gray-600">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-32 w-auto object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=Image+Error";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-md transition duration-300 flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaBolt className="mr-2" />
                  {editingId ? "Update Flash Sale" : "Create Flash Sale"}
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md transition duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
          <FaBolt className="text-yellow-500 mr-2" />
          Current Flash Sales
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : flashSales.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            No flash sales found. Create one above.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {flashSales.map((flashSale) => (
                  <tr
                    key={flashSale.$id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {flashSale.title || "Untitled Flash Sale"}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-red-600 dark:text-red-400">
                      ₹{flashSale.price || 0}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {flashSale.date || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      {flashSale.imageUrl ? (
                        <img
                          src={flashSale.imageUrl}
                          alt={flashSale.title}
                          className="h-12 w-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48?text=Error";
                          }}
                        />
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleEdit(flashSale)}
                        className="text-blue-500 hover:text-blue-700 mr-4 transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(flashSale.$id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashSaleTab;
