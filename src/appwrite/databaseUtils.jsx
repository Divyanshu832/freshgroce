import {
  databases,
  teams,
  DATABASE_ID,
  PRODUCT_COLLECTION_ID,
  ORDER_COLLECTION_ID,
  USER_COLLECTION_ID,
  REVIEW_COLLECTION_ID,
  FLASH_SALE_COLLECTION_ID,
  ID,
  Query,
} from "./appwriteConfig";
import { isUserAdmin } from "./authUtils";

// Order status enum
export const OrderStatus = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Payment method enum
export const PaymentMethod = {
  UPI: "UPI",
  COD: "COD",
};

// Product related operations
export const addProductToDb = async (productData) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can add products.",
      };
    }

    // Prepare product data with correct field names to match Appwrite schema
    const productDataToSave = {
      title: productData.title,
      price: productData.price,
      imageUrl: productData.imageUrl,
      category: productData.category,
      description: productData.description,
      // Use "Date" (capital D) to match the schema in Appwrite
      Date:
        productData.date ||
        new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      isFeatured: false, // Default to not featured
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      PRODUCT_COLLECTION_ID,
      ID.unique(),
      productDataToSave
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error adding product:", error);
    // Handle permission error with a fallback
    if (error.message.includes("not authorized")) {
      return {
        success: false,
        error:
          "Permission denied. Please update Appwrite collection permissions.",
        data: { ...productData, $id: "temp-" + ID.unique() }, // Return the data with a temporary ID
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAllProducts = async () => {
  try {
    // Get products and sort by creation date if possible
    try {
      // Try to sort by the Appwrite $createdAt system attribute first
      const response = await databases.listDocuments(
        DATABASE_ID,
        PRODUCT_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );

      // Map the response to include the date field with proper format
      const products = response.documents.map((product) => {
        // If Date field exists, use it
        if (product.Date) {
          return {
            ...product,
            date: product.Date, // Add lowercase date for compatibility
          };
        }
        // If no Date field but $createdAt exists, format it
        else if (product.$createdAt) {
          const createdDate = new Date(product.$createdAt);
          const formattedDate = createdDate.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          return {
            ...product,
            date: formattedDate, // Add lowercase date
            Date: formattedDate, // Also add uppercase Date to be thorough
          };
        }
        // Fallback to current date if nothing else
        else {
          const fallbackDate = new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          return {
            ...product,
            date: fallbackDate,
            Date: fallbackDate,
          };
        }
      });

      return {
        success: true,
        data: products,
      };
    } catch (queryError) {
      // Fallback to retrieving without sorting
      console.log(
        "Query with orderDesc failed, trying without sorting:",
        queryError
      );
      const response = await databases.listDocuments(
        DATABASE_ID,
        PRODUCT_COLLECTION_ID
      );

      // Apply the same date mapping as above
      const products = response.documents.map((product) => {
        if (product.Date) {
          return {
            ...product,
            date: product.Date,
          };
        } else if (product.$createdAt) {
          const createdDate = new Date(product.$createdAt);
          const formattedDate = createdDate.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          return {
            ...product,
            date: formattedDate,
            Date: formattedDate,
          };
        } else {
          const fallbackDate = new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          return {
            ...product,
            date: fallbackDate,
            Date: fallbackDate,
          };
        }
      });

      return {
        success: true,
        data: products,
      };
    }
  } catch (error) {
    console.error("Error getting products:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getProductById = async (productId) => {
  try {
    if (!productId) {
      console.error("Error: No product ID provided");
      return {
        success: false,
        error: "No product ID provided",
      };
    }

    const response = await databases.getDocument(
      DATABASE_ID,
      PRODUCT_COLLECTION_ID,
      productId
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(`Error getting product with ID ${productId}:`, error);
    // Return a more user-friendly error message
    return {
      success: false,
      error:
        "Product not found. It may have been removed or the link is invalid.",
    };
  }
};

export const updateProductInDb = async (productId, productData) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can update products.",
      };
    }

    // Clean up the data - remove Appwrite system properties
    const cleanProductData = {
      title: productData.title,
      price: productData.price,
      imageUrl: productData.imageUrl,
      category: productData.category,
      description: productData.description,
      Date: productData.date || productData.Date,
      isFeatured: productData.isFeatured || false,
    };

    const response = await databases.updateDocument(
      DATABASE_ID,
      PRODUCT_COLLECTION_ID,
      productId,
      cleanProductData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteProductFromDb = async (productId) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can delete products.",
      };
    }

    await databases.deleteDocument(
      DATABASE_ID,
      PRODUCT_COLLECTION_ID,
      productId
    );
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get count of featured products to enforce limit
export const getFeaturedProductsCount = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PRODUCT_COLLECTION_ID,
      [Query.equal("isFeatured", true)]
    );
    return {
      success: true,
      count: response.documents.length,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error counting featured products:", error);
    return {
      success: false,
      error: error.message,
      count: 0,
    };
  }
};

// Order related operations
export const addOrderToDb = async (orderData) => {
  try {
    // Remove time field that might cause schema errors
    const orderDataToSave = {
      ...orderData,
      // Don't include time field if it's not in the schema
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      ORDER_COLLECTION_ID,
      ID.unique(),
      orderDataToSave
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error adding order:", error);

    // Handle permission errors with a fallback
    if (error.message.includes("not authorized")) {
      console.log(
        "Permission denied for order creation. Please update Appwrite permissions."
      );
      return {
        success: false,
        error:
          "Permission denied. Please update Appwrite collection permissions.",
        data: { ...orderData, $id: "temp-" + ID.unique() }, // Return with a temporary ID
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAllOrders = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDER_COLLECTION_ID,
      [Query.orderDesc("$createdAt")] // Sort by newest first
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting orders:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getUserOrders = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDER_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// New functions to manage order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can update order status.",
      };
    }

    // Validate that the status is one of the allowed values
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status value. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      };
    }

    const response = await databases.updateDocument(
      DATABASE_ID,
      ORDER_COLLECTION_ID,
      orderId,
      { status }
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteOrder = async (orderId) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can delete orders.",
      };
    }

    await databases.deleteDocument(DATABASE_ID, ORDER_COLLECTION_ID, orderId);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// User related operations
export const getAllUsers = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Review related operations
export const addReviewToDb = async (reviewData) => {
  try {
    // Prepare review data with correct field names
    const reviewDataToSave = {
      userId: reviewData.userId,
      userName: reviewData.userName,
      productId: reviewData.productId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      REVIEW_COLLECTION_ID,
      ID.unique(),
      reviewDataToSave
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error adding review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAllReviews = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REVIEW_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting reviews:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getProductReviews = async (productId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REVIEW_COLLECTION_ID,
      [Query.equal("productId", productId), Query.orderDesc("$createdAt")]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting product reviews:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteReviewFromDb = async (reviewId) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can delete reviews.",
      };
    }

    await databases.deleteDocument(DATABASE_ID, REVIEW_COLLECTION_ID, reviewId);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateReviewInDb = async (reviewId, reviewData) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      REVIEW_COLLECTION_ID,
      reviewId,
      reviewData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteUserReviewFromDb = async (reviewId, userId) => {
  try {
    // First get the review to verify the user is the owner
    const review = await databases.getDocument(
      DATABASE_ID,
      REVIEW_COLLECTION_ID,
      reviewId
    );

    // Check if the current user is the owner of the review
    if (review.userId !== userId) {
      return {
        success: false,
        error: "Permission denied. You can only delete your own reviews.",
      };
    }

    await databases.deleteDocument(DATABASE_ID, REVIEW_COLLECTION_ID, reviewId);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Flash Sale related operations
export const addFlashSaleToDb = async (flashSaleData) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can add flash sales.",
      };
    }

    // Only include the required 5 attributes
    // Ensure price is stored as a string, not a number
    const flashSaleToSave = {
      title: flashSaleData.title || "Untitled Flash Sale",
      description: flashSaleData.description || "",
      price: String(flashSaleData.price || "0"), // Convert price to string
      imageUrl: flashSaleData.imageUrl || "",
      date: flashSaleData.date || new Date().toLocaleDateString(),
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      ID.unique(),
      flashSaleToSave
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error adding flash sale:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAllFlashSales = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting flash sales:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getActiveFlashSales = async () => {
  try {
    const currentDate = new Date().toISOString();
    const response = await databases.listDocuments(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      [
        Query.equal("isActive", true),
        Query.lessThanEqual("startDate", currentDate),
        Query.greaterThanEqual("endDate", currentDate),
      ]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting active flash sales:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateFlashSaleInDb = async (flashSaleId, flashSaleData) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can update flash sales.",
      };
    }

    // Only include the required 5 attributes
    const cleanFlashSaleData = {
      title: flashSaleData.title || "Untitled Flash Sale",
      description: flashSaleData.description || "",
      price: String(flashSaleData.price || "0"), // Convert price to string
      imageUrl: flashSaleData.imageUrl || "",
      date: flashSaleData.date || new Date().toLocaleDateString(),
    };

    const response = await databases.updateDocument(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      flashSaleId,
      cleanFlashSaleData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error updating flash sale:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFlashSaleFromDb = async (flashSaleId) => {
  try {
    // First check if the user is an admin
    const adminCheck = await isUserAdmin();
    if (!adminCheck.success || !adminCheck.isAdmin) {
      return {
        success: false,
        error: "Permission denied. Only admins can delete flash sales.",
      };
    }

    await databases.deleteDocument(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      flashSaleId
    );
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting flash sale:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getFlashSalesByProductId = async (productId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      [Query.equal("productId", productId)]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting flash sales for product:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Flash sale functions to get limited flash sales
export const getFlashSalesCount = async (limit = 4) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FLASH_SALE_COLLECTION_ID,
      [Query.limit(limit)]
    );
    return {
      success: true,
      data: response.documents,
    };
  } catch (error) {
    console.error("Error getting limited flash sales:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};
