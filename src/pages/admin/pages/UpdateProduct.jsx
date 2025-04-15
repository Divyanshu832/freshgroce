import React, { useContext, useEffect, useState } from "react";
import myContext from "../../../context/data/myContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  databases,
  DATABASE_ID,
  PRODUCT_COLLECTION_ID,
} from "../../../appwrite/appwriteConfig";
import Loader from "../../../components/loader/loader";

function UpdateProduct() {
  const context = useContext(myContext);
  const {
    products,
    setProducts,
    updateProduct,
    loading: contextLoading,
  } = context;
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Get product ID from URL query parameter
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Extract productId from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const productId = queryParams.get("id");

        if (!productId) {
          toast.error("No product ID provided");
          navigate("/dashboard");
          return;
        }

        // Fetch product data from database
        const response = await databases.getDocument(
          DATABASE_ID,
          PRODUCT_COLLECTION_ID,
          productId
        );

        if (response) {
          setProducts(response);
          setLoading(false);
        } else {
          toast.error("Product not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error fetching product details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [location.search, navigate, setProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {contextLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <Loader />
        </div>
      )}
      <div className="flex justify-center items-center h-screen">
        <div className="bg-gray-800 px-10 py-10 rounded-xl">
          <div className="">
            <h1 className="text-center text-white text-xl mb-4 font-bold">
              Update Product
            </h1>
          </div>
          <div>
            <input
              type="text"
              onChange={(e) =>
                setProducts({ ...products, title: e.target.value })
              }
              value={products.title || ""}
              name="title"
              className=" bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none"
              placeholder="Product title"
            />
          </div>
          <div>
            <input
              type="text"
              name="price"
              onChange={(e) =>
                setProducts({ ...products, price: e.target.value })
              }
              value={products.price || ""}
              className=" bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none"
              placeholder="Product price"
            />
          </div>
          <div>
            <input
              type="text"
              name="imageurl"
              onChange={(e) =>
                setProducts({ ...products, imageUrl: e.target.value })
              }
              value={products.imageUrl || ""}
              className=" bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none"
              placeholder="Product imageUrl"
            />
          </div>
          <div>
            <input
              type="text"
              name="category"
              onChange={(e) =>
                setProducts({ ...products, category: e.target.value })
              }
              value={products.category || ""}
              className=" bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none"
              placeholder="Product category"
            />
          </div>
          <div>
            <textarea
              cols="30"
              rows="10"
              name="description"
              onChange={(e) =>
                setProducts({ ...products, description: e.target.value })
              }
              className=" bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none"
              placeholder="Product description"
              value={products.description || ""}
            ></textarea>
          </div>

          <div className="flex justify-center mb-3">
            <button
              onClick={updateProduct}
              className="bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
              disabled={contextLoading}
            >
              {contextLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProduct;
