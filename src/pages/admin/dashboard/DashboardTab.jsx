import React, { useContext, useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import myContext from "../../../context/data/myContext";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import {
  FaUser,
  FaCartPlus,
  FaStar,
  FaRegStar,
  FaHotjar,
} from "react-icons/fa";
import { AiFillShopping, AiFillPlusCircle, AiFillDelete } from "react-icons/ai";
import { Link, Navigate } from "react-router-dom";
import {
  getAllReviews,
  deleteReviewFromDb,
  updateProductInDb,
  getFeaturedProductsCount,
} from "../../../appwrite/databaseUtils";
import { toast } from "react-toastify";
import FlashSaleTab from "./FlashSaleTab";
import OrdersTab from "./OrdersTab";

function DashboardTab() {
  const context = useContext(myContext);
  const { mode, product, edithandle, deleteProduct, order, user } = context;
  let [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  // State to track featured product count
  const [featuredCount, setFeaturedCount] = useState(0);

  // Get featured products count
  useEffect(() => {
    const getFeaturedCount = async () => {
      try {
        const response = await getFeaturedProductsCount();
        if (response.success) {
          setFeaturedCount(response.count);
        }
      } catch (error) {
        console.error("Error getting featured count:", error);
      }
    };

    getFeaturedCount();
  }, []);

  // Toggle featured status of product
  const toggleFeatured = async (product) => {
    // Current featured status
    const currentlyFeatured = product.isFeatured || false;

    // If trying to feature and already have 4 featured products
    if (!currentlyFeatured && featuredCount >= 4) {
      toast.warning(
        "Only 4 products can be featured. Please unfeature another product first."
      );
      return;
    }

    try {
      // Prepare clean product data
      const updatedProduct = {
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        description: product.description,
        Date: product.date || product.Date,
        isFeatured: !currentlyFeatured,
      };

      const response = await updateProductInDb(product.$id, updatedProduct);

      if (response.success) {
        // Update the local count
        setFeaturedCount((prev) => (currentlyFeatured ? prev - 1 : prev + 1));

        // Update product in the local state directly since we can't access getProductData
        const updatedProducts = context.product.map((p) => {
          if (p.$id === product.$id) {
            return { ...p, isFeatured: !currentlyFeatured };
          }
          return p;
        });

        // This will trigger a re-render
        // We can't directly modify context.product, but the page will reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        toast.success(
          `Product ${
            currentlyFeatured ? "removed from" : "added to"
          } featured list`
        );
      } else {
        toast.error("Failed to update product featured status");
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("An error occurred");
    }
  };

  // Fetch all reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getAllReviews();
      if (response.success) {
        setReviews(response.data);
      } else {
        toast.error(response.error || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("An error occurred while fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await deleteReviewFromDb(reviewId);
      if (response.success) {
        toast.success("Review deleted successfully");
        // Refresh the reviews list
        fetchReviews();
      } else {
        toast.error(response.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting the review");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const goToAdd = () => {
    window.location.href = "/addproduct";
  };

  return (
    <div>
      <div className="container mx-auto">
        <div className="tab container mx-auto ">
          <Tabs defaultIndex={0} className=" ">
            <TabList className="md:flex md:space-x-8 bg-  grid grid-cols-2 text-center gap-4   md:justify-center mb-10 ">
              <Tab>
                <button
                  type="button"
                  className="font-medium border-b-2 hover:shadow-purple-700 border-purple-500 text-purple-500 rounded-lg text-xl shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]  px-5 py-1.5 text-center bg-[#605d5d12] "
                >
                  <div className="flex gap-2 items-center">
                    <MdOutlineProductionQuantityLimits />
                    Products
                  </div>{" "}
                </button>
              </Tab>
              <Tab>
                <button
                  type="button"
                  className="font-medium border-b-2 border-pink-500 bg-[#605d5d12] text-pink-500  hover:shadow-pink-700  rounded-lg text-xl shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]    px-5 py-1.5 text-center "
                >
                  <div className="flex gap-2 items-center">
                    <AiFillShopping /> Order
                  </div>
                </button>
              </Tab>
              <Tab>
                <button
                  type="button"
                  className="font-medium border-b-2 border-green-500 bg-[#605d5d12] text-green-500 rounded-lg text-xl  hover:shadow-green-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]   px-5 py-1.5 text-center "
                >
                  <div className="flex gap-2 items-center">
                    <FaUser /> Users
                  </div>
                </button>
              </Tab>
              <Tab>
                <button
                  type="button"
                  className="font-medium border-b-2 border-yellow-500 bg-[#605d5d12] text-yellow-500 rounded-lg text-xl hover:shadow-yellow-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] px-5 py-1.5 text-center "
                >
                  <div className="flex gap-2 items-center">
                    <FaStar /> Reviews
                  </div>
                </button>
              </Tab>
              <Tab>
                <button
                  type="button"
                  className="font-medium border-b-2 border-red-500 bg-[#605d5d12] text-red-500 rounded-lg text-xl hover:shadow-red-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] px-5 py-1.5 text-center "
                >
                  <div className="flex gap-2 items-center">
                    <FaHotjar /> Flash Sales
                  </div>
                </button>
              </Tab>
            </TabList>
            {/* product  */}
            <TabPanel>
              <div className="  px-4 md:px-0 mb-16">
                <h1
                  className=" text-center mb-5 text-3xl font-semibold underline"
                  style={{ color: mode === "dark" ? "white" : "" }}
                >
                  Product Details
                </h1>
                <div className=" flex justify-end">
                  <div onClick={goToAdd}>
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-pink-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] border hover:bg-pink-700 outline-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                      style={{
                        backgroundColor: mode === "dark" ? "rgb(46 49 55)" : "",
                        color: mode === "dark" ? "white" : "",
                      }}
                    >
                      {" "}
                      <div className="flex gap-2 items-center">
                        Add Product <FaCartPlus size={20} />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="relative overflow-x-auto ">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400  ">
                    <thead
                      className="text-xs border border-gray-600 text-black uppercase bg-gray-200 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]"
                      style={{
                        backgroundColor: mode === "dark" ? "rgb(46 49 55)" : "",
                        color: mode === "dark" ? "white" : "",
                      }}
                    >
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          S.No
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Image
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Featured
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    {product.map((item, index) => {
                      const { title, price, imageUrl, category, date } = item;
                      return (
                        <tbody className="">
                          <tr
                            className="bg-gray-50 border-b  dark:border-gray-700"
                            style={{
                              backgroundColor:
                                mode === "dark" ? "rgb(46 49 55)" : "",
                              color: mode === "dark" ? "white" : "",
                            }}
                          >
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {index + 1}.
                            </td>
                            <th
                              scope="row"
                              className="px-6 py-4 font-medium text-black whitespace-nowrap"
                            >
                              <img className="w-16" src={imageUrl} alt="img" />
                            </th>
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {title}
                            </td>
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              ₹{price}
                            </td>
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {category}
                            </td>
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {date}
                            </td>
                            <td
                              className="px-6 py-4 text-black "
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {item.isFeatured ? (
                                <FaStar className="text-yellow-500" size={18} />
                              ) : (
                                "No"
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className=" flex gap-2 cursor-pointer text-black "
                                style={{
                                  color: mode === "dark" ? "white" : "",
                                }}
                              >
                                <div onClick={() => deleteProduct(item)}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <Link
                                    to={"/updateproduct"}
                                    onClick={edithandle(item)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-6 h-6"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                      />
                                    </svg>
                                  </Link>
                                </div>
                                <div
                                  onClick={() => toggleFeatured(item)}
                                  className="cursor-pointer"
                                  title={
                                    item.isFeatured
                                      ? "Remove from featured"
                                      : "Add to featured"
                                  }
                                >
                                  {item.isFeatured ? (
                                    <FaStar
                                      className="text-yellow-500"
                                      size={20}
                                    />
                                  ) : (
                                    <FaRegStar
                                      className="text-gray-500"
                                      size={20}
                                    />
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              {/* Use the new OrdersTab component here */}
              <OrdersTab mode={mode} />
            </TabPanel>
            <TabPanel>
              <div className="relative overflow-x-auto mb-10">
                <h1
                  className=" text-center mb-5 text-3xl font-semibold underline"
                  style={{ color: mode === "dark" ? "white" : "" }}
                >
                  User Details
                </h1>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead
                    className="text-xs text-black uppercase bg-gray-200 "
                    style={{
                      backgroundColor: mode === "dark" ? "rgb(46 49 55)" : "",
                      color: mode === "dark" ? "white" : "",
                    }}
                  >
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        S.No
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Uid
                      </th>
                    </tr>
                  </thead>
                  {user.map((item, index) => {
                    const { name, uid, email, date } = item;
                    return (
                      <tbody>
                        <tr
                          className="bg-gray-50 border-b  dark:border-gray-700"
                          style={{
                            backgroundColor:
                              mode === "dark" ? "rgb(46 49 55)" : "",
                            color: mode === "dark" ? "white" : "",
                          }}
                        >
                          <td
                            className="px-6 py-4 text-black "
                            style={{ color: mode === "dark" ? "white" : "" }}
                          >
                            {index + 1}.
                          </td>
                          <td
                            className="px-6 py-4 text-black "
                            style={{ color: mode === "dark" ? "white" : "" }}
                          >
                            {name}
                          </td>
                          <td
                            className="px-6 py-4 text-black "
                            style={{ color: mode === "dark" ? "white" : "" }}
                          >
                            {email}
                          </td>
                          <td
                            className="px-6 py-4 text-black "
                            style={{ color: mode === "dark" ? "white" : "" }}
                          >
                            {uid}
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </TabPanel>
            {/* Reviews Tab */}
            <TabPanel>
              <div className="relative overflow-x-auto mb-10">
                <h1
                  className="text-center mb-5 text-3xl font-semibold underline"
                  style={{ color: mode === "dark" ? "white" : "" }}
                >
                  Review Details
                </h1>
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No reviews available</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead
                      className="text-xs text-black uppercase bg-gray-200"
                      style={{
                        backgroundColor: mode === "dark" ? "rgb(46 49 55)" : "",
                        color: mode === "dark" ? "white" : "",
                      }}
                    >
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          S.No
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Image
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Rating
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Review
                        </th>
                        <th scope="col" className="px-6 py-3">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review, index) => {
                        // Find the corresponding product to get its image and title
                        const productItem =
                          product.find(
                            (item) => item.$id === review.productId
                          ) || {};
                        return (
                          <tr
                            key={review.$id}
                            className="bg-gray-50 border-b dark:border-gray-700"
                            style={{
                              backgroundColor:
                                mode === "dark" ? "rgb(46 49 55)" : "",
                              color: mode === "dark" ? "white" : "",
                            }}
                          >
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {index + 1}.
                            </td>
                            <td className="px-6 py-4 font-medium text-black whitespace-nowrap">
                              {productItem.imageUrl ? (
                                <img
                                  className="w-16"
                                  src={productItem.imageUrl}
                                  alt="Product"
                                />
                              ) : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </td>
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {productItem.title || "Unknown Product"}
                            </td>
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    color={
                                      i < review.rating ? "#FFD700" : "#e4e5e9"
                                    }
                                    size={16}
                                  />
                                ))}
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {review.comment || "No comment"}
                            </td>
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {review.userName || "Anonymous"}
                            </td>
                            <td
                              className="px-6 py-4 text-black"
                              style={{ color: mode === "dark" ? "white" : "" }}
                            >
                              {review.date}
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="flex gap-2 cursor-pointer text-black"
                                style={{
                                  color: mode === "dark" ? "white" : "",
                                }}
                              >
                                <div
                                  onClick={() => handleDeleteReview(review.$id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </TabPanel>
            {/* flash sale panel */}
            <TabPanel>
              <FlashSaleTab />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
