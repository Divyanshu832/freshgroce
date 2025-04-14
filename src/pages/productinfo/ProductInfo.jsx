import React, { useContext, useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import myContext from "../../context/data/myContext";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCart, decreaseCart } from "../../redux/cartSlice";
import {
  getProductById,
  getProductReviews,
  deleteUserReviewFromDb,
  updateReviewInDb,
} from "../../appwrite/databaseUtils";
import { FaPlus, FaMinus, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import { account } from "../../appwrite/appwriteConfig";

function ProductInfo() {
  const context = useContext(myContext);
  const { loading, setLoading } = context;
  const navigate = useNavigate();

  const [products, setProducts] = useState("");
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const params = useParams();

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await account.get();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const getProductData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate that we have a product ID
      if (!params.id) {
        setError("Invalid product ID");
        toast.error("Invalid product ID");
        setLoading(false);
        return;
      }

      const response = await getProductById(params.id);
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.error || "Failed to fetch product details");
        toast.error(response.error || "Failed to fetch product details");
        // Navigate back to home page after a short delay if product not found
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in getProductData:", error);
      setError("An unexpected error occurred");
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  // Fetch product reviews
  const fetchProductReviews = async (productId) => {
    if (!productId) return;

    setReviewsLoading(true);
    try {
      const response = await getProductReviews(productId);
      if (response.success) {
        setReviews(response.data);
      } else {
        console.error("Failed to fetch reviews:", response.error);
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    getProductData();
  }, [params.id]); // Re-fetch if the product ID changes

  // Fetch reviews when product data is loaded
  useEffect(() => {
    if (products && products.$id) {
      fetchProductReviews(products.$id);
    }
  }, [products]);

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  // Get item quantity from cart
  const getItemQuantity = (id) => {
    const item = cartItems.find((item) => item.$id === id);
    return item ? item.quantity : 0;
  };

  // add to cart
  const addCart = (product) => {
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  // decrease from cart
  const decreaseItem = (product) => {
    dispatch(decreaseCart(product));
    toast.info("Item quantity decreased");
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle editing a review
  const handleEditReview = (review) => {
    setEditReviewId(review.$id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditModalOpen(true);
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) {
      toast.error("Please login to manage your reviews");
      return;
    }

    try {
      const response = await deleteUserReviewFromDb(reviewId, currentUser.$id);
      if (response.success) {
        toast.success("Review deleted successfully");
        // Refresh the reviews
        fetchProductReviews(products.$id);
      } else {
        toast.error(response.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting the review");
    }
  };

  // Handle saving the edited review
  const handleSaveEditedReview = async () => {
    if (!currentUser) {
      toast.error("Please login to edit your review");
      setIsEditModalOpen(false);
      return;
    }

    if (editRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const reviewData = {
        rating: editRating,
        comment: editComment,
        // Update the date to show it was edited
        date:
          new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }) + " (edited)",
      };

      const response = await updateReviewInDb(editReviewId, reviewData);
      if (response.success) {
        toast.success("Review updated successfully");
        // Refresh the reviews
        fetchProductReviews(products.$id);
        // Close the edit modal
        setIsEditModalOpen(false);
        // Reset edit states
        setEditReviewId(null);
        setEditRating(0);
        setEditComment("");
      } else {
        toast.error(response.error || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("An error occurred while updating your review");
    }
  };

  return (
    <Layout>
      <section
        className="text-gray-600 body-font overflow-hidden"
        style={{ color: context.mode === "dark" ? "white" : "" }}
      >
        <div className="container px-5 py-10 mx-auto">
          {loading && (
            <div className="text-center py-10">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p
                className="mt-2"
                style={{ color: context.mode === "dark" ? "white" : "" }}
              >
                Loading product details...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-10">
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <p className="mt-2">Redirecting to home page...</p>
              </div>
            </div>
          )}

          {products && !loading && !error && (
            <>
              <div className="lg:w-4/5 mx-auto flex flex-wrap">
                <img
                  alt={products.title || "Product image"}
                  className="lg:w-1/3 w-full lg:h-auto h-64 object-cover object-center rounded"
                  src={products.imageUrl}
                />
                <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                  <h2
                    className="text-sm title-font text-gray-500 tracking-widest"
                    style={{ color: context.mode === "dark" ? "#cbd5e0" : "" }}
                  >
                    FRESHGROCE
                  </h2>
                  <h1
                    className="text-gray-900 text-3xl title-font font-medium mb-1"
                    style={{ color: context.mode === "dark" ? "white" : "" }}
                  >
                    {products.title}
                  </h1>
                  <div className="flex mb-4">
                    <span className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={
                            index < calculateAverageRating()
                              ? "#FFD700"
                              : "#e4e5e9"
                          }
                          size={16}
                        />
                      ))}
                      <span
                        className="text-gray-600 ml-3"
                        style={{
                          color: context.mode === "dark" ? "#cbd5e0" : "",
                        }}
                      >
                        {reviews.length} Reviews
                      </span>
                    </span>
                    <span className="flex ml-3 pl-3 py-2 border-l-2 border-gray-200 space-x-2s">
                      <a className="text-gray-500">
                        <svg
                          fill="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      </a>
                      <a className="text-gray-500">
                        <svg
                          fill="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                      </a>
                      <a className="text-gray-500">
                        <svg
                          fill="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                      </a>
                    </span>
                  </div>
                  <p
                    className="leading-relaxed border-b-2 mb-5 pb-5"
                    style={{
                      color: context.mode === "dark" ? "white" : "",
                      borderColor: context.mode === "dark" ? "#4a5568" : "",
                    }}
                  >
                    {products.description}
                  </p>

                  <div className="flex items-center mb-5">
                    <span
                      className="title-font font-medium text-2xl text-gray-900 mr-5"
                      style={{ color: context.mode === "dark" ? "white" : "" }}
                    >
                      ₹{products.price}
                    </span>

                    {getItemQuantity(products.$id) === 0 ? (
                      <button
                        onClick={() => addCart(products)}
                        className="flex text-white bg-green-600 border-0 py-2 px-6 focus:outline-none hover:bg-green-700 rounded"
                      >
                        Add To Cart
                      </button>
                    ) : (
                      <div
                        className="flex items-center border border-gray-300 rounded-lg"
                        style={{
                          borderColor: context.mode === "dark" ? "#4a5568" : "",
                        }}
                      >
                        <button
                          onClick={() => decreaseItem(products)}
                          className="bg-gray-100 py-2 px-4 rounded-l-lg hover:bg-gray-200"
                          style={{
                            backgroundColor:
                              context.mode === "dark" ? "#4a5568" : "",
                            color: context.mode === "dark" ? "white" : "",
                          }}
                        >
                          <FaMinus size={14} />
                        </button>
                        <span
                          className="px-4 py-2 font-medium text-lg"
                          style={{
                            color: context.mode === "dark" ? "white" : "",
                          }}
                        >
                          {getItemQuantity(products.$id)}
                        </span>
                        <button
                          onClick={() => addCart(products)}
                          className="bg-gray-100 py-2 px-4 rounded-r-lg hover:bg-gray-200"
                          style={{
                            backgroundColor:
                              context.mode === "dark" ? "#4a5568" : "",
                            color: context.mode === "dark" ? "white" : "",
                          }}
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                    )}

                    <button className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4">
                      <svg
                        fill="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                  </div>

                  <div
                    className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5"
                    style={{
                      borderColor: context.mode === "dark" ? "#4a5568" : "",
                    }}
                  >
                    <div className="flex items-center">
                      <span
                        className="mr-3"
                        style={{
                          color: context.mode === "dark" ? "white" : "",
                        }}
                      >
                        Quantity in cart:
                      </span>
                      <span
                        className="font-medium"
                        style={{
                          color: context.mode === "dark" ? "white" : "",
                        }}
                      >
                        {getItemQuantity(products.$id)}
                      </span>
                    </div>
                  </div>

                  <div className="flex">
                    <a
                      href="/cart"
                      className="flex ml-auto text-white bg-green-600 border-0 py-2 px-6 focus:outline-none hover:bg-green-700 rounded"
                    >
                      Go to Cart
                    </a>
                  </div>

                  <div className="mt-6">
                    <ReviewModal
                      productId={products.$id}
                      productTitle={products.title}
                      onReviewSubmitted={() =>
                        fetchProductReviews(products.$id)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Product Reviews Section - Moved out of the sidebar and placed below */}
              <div className="lg:w-4/5 mx-auto mt-16">
                <h2
                  className="text-2xl font-semibold mb-4 border-b pb-2"
                  style={{
                    color: context.mode === "dark" ? "white" : "",
                    borderColor: context.mode === "dark" ? "#4a5568" : "",
                  }}
                >
                  Customer Reviews
                </h2>
                <div className="mb-6 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        color={
                          index < calculateAverageRating()
                            ? "#FFD700"
                            : "#e4e5e9"
                        }
                        size={24}
                      />
                    ))}
                  </div>
                  <p
                    className="ml-2 text-lg"
                    style={{ color: context.mode === "dark" ? "white" : "" }}
                  >
                    {calculateAverageRating()} out of 5 ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </p>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-4">
                    <p
                      className="text-gray-500"
                      style={{
                        color: context.mode === "dark" ? "#cbd5e0" : "",
                      }}
                    >
                      Loading reviews...
                    </p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div
                    className="text-center py-4 bg-gray-50 rounded-lg p-8"
                    style={{
                      backgroundColor: context.mode === "dark" ? "#2d3748" : "",
                    }}
                  >
                    <p
                      className="text-gray-500"
                      style={{
                        color: context.mode === "dark" ? "#cbd5e0" : "",
                      }}
                    >
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                      <div
                        key={review.$id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor:
                            context.mode === "dark" ? "#2d3748" : "",
                          borderColor: context.mode === "dark" ? "#4a5568" : "",
                        }}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  color={
                                    index < review.rating
                                      ? "#FFD700"
                                      : "#e4e5e9"
                                  }
                                  size={16}
                                />
                              ))}
                            </div>
                            <span
                              className="ml-2 font-medium"
                              style={{
                                color: context.mode === "dark" ? "white" : "",
                              }}
                            >
                              {review.userName}
                            </span>
                          </div>
                          <span
                            className="text-gray-500 text-sm"
                            style={{
                              color: context.mode === "dark" ? "#cbd5e0" : "",
                            }}
                          >
                            {review.date}
                          </span>
                        </div>
                        <p
                          className="text-gray-700"
                          style={{
                            color: context.mode === "dark" ? "white" : "",
                          }}
                        >
                          {review.comment}
                        </p>

                        {/* Edit and Delete buttons - Only shown for the user's own reviews */}
                        {currentUser && currentUser.$id === review.userId && (
                          <div className="flex justify-end mt-3 space-x-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                              style={{
                                color: context.mode === "dark" ? "#90cdf4" : "",
                                hoverColor:
                                  context.mode === "dark" ? "#63b3ed" : "",
                              }}
                            >
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.$id)}
                              className="text-red-600 hover:text-red-800 flex items-center"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Edit Review Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              backgroundColor: context.mode === "dark" ? "#2d3748" : "",
              color: context.mode === "dark" ? "white" : "",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-medium"
                style={{ color: context.mode === "dark" ? "white" : "" }}
              >
                Edit Your Review
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                style={{ color: context.mode === "dark" ? "#cbd5e0" : "" }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                style={{ color: context.mode === "dark" ? "white" : "" }}
              >
                Your Rating
              </label>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <FaStar
                      key={index}
                      className="cursor-pointer"
                      color={editRating >= ratingValue ? "#FFD700" : "#e4e5e9"}
                      size={32}
                      onClick={() => setEditRating(ratingValue)}
                    />
                  );
                })}
                <span className="ml-2 text-gray-600">
                  {editRating > 0 ? `${editRating} out of 5` : ""}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="editComment"
                className="block mb-2 text-sm font-medium text-gray-900"
                style={{ color: context.mode === "dark" ? "white" : "" }}
              >
                Your Review
              </label>
              <textarea
                id="editComment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows="4"
                className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                placeholder="Share your thoughts about this product..."
                style={{
                  backgroundColor: context.mode === "dark" ? "#4a5568" : "",
                  color: context.mode === "dark" ? "white" : "",
                  borderColor: context.mode === "dark" ? "#718096" : "",
                }}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                style={{
                  backgroundColor: context.mode === "dark" ? "#4a5568" : "",
                  color: context.mode === "dark" ? "white" : "",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedReview}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ProductInfo;
