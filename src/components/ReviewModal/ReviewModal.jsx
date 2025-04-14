import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { addReviewToDb } from "../../appwrite/databaseUtils";
import { account } from "../../appwrite/appwriteConfig";
import { toast } from "react-toastify";

export default function ReviewModal({
  productId,
  productTitle,
  onReviewSubmitted,
}) {
  let [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get current user info
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    getCurrentUser();
  }, []);

  function closeModal() {
    setIsOpen(false);
    // Reset form
    setRating(0);
    setComment("");
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      closeModal();
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        userId: user.$id,
        userName: user.name,
        productId: productId,
        rating: rating,
        comment: comment,
      };

      const response = await addReviewToDb(reviewData);
      if (response.success) {
        toast.success("Review submitted successfully");
        closeModal();

        // Call the callback function to refresh the reviews
        if (onReviewSubmitted && typeof onReviewSubmitted === "function") {
          onReviewSubmitted();
        }
      } else {
        toast.error(response.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center rounded-lg">
        <button
          type="button"
          onClick={openModal}
          className="w-full bg-green-500 py-2 text-center rounded-lg text-white font-bold hover:bg-green-600"
        >
          Submit your review
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-2 text-left align-middle shadow-xl transition-all bg-gray-50">
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                      onClick={closeModal}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>

                  <section className="">
                    <div className="flex flex-col items-center justify-center py-8 mx-auto lg:py-0">
                      <div className="w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                          <h3 className="text-xl font-medium text-gray-900 text-center">
                            Review for {productTitle}
                          </h3>

                          <div className="space-y-4 md:space-y-6">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900">
                                Your Rating
                              </label>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, index) => {
                                  const ratingValue = index + 1;
                                  return (
                                    <FaStar
                                      key={index}
                                      className="cursor-pointer"
                                      color={
                                        (hover || rating) >= ratingValue
                                          ? "#FFD700"
                                          : "#e4e5e9"
                                      }
                                      size={32}
                                      onClick={() => setRating(ratingValue)}
                                      onMouseEnter={() => setHover(ratingValue)}
                                      onMouseLeave={() => setHover(0)}
                                    />
                                  );
                                })}
                                <span className="ml-2 text-gray-600">
                                  {rating > 0 ? `${rating} out of 5` : ""}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="comment"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Your Review
                              </label>
                              <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                                className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                placeholder="Share your thoughts about this product..."
                              />
                            </div>

                            <button
                              onClick={handleSubmitReview}
                              disabled={loading}
                              type="button"
                              className="focus:outline-none w-full text-white bg-green-600 hover:bg-green-700 outline-0 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                            >
                              {loading ? "Submitting..." : "Submit Review"}
                            </button>

                            {!user && (
                              <p className="text-sm text-red-500 mt-2">
                                Please sign in to leave a review
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
