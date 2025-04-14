import easyinvoice from "easyinvoice";
import {
  storage,
  databases,
  ID,
  DATABASE_ID,
  ORDER_COLLECTION_ID,
  INVOICE_BUCKET_ID,
} from "./appwriteConfig";

/**
 * Generate and store an invoice for an order
 * @param {Object} orderData - The order data
 * @returns {Promise<Object>} - The result object with success status and invoice URL
 */
export const generateAndStoreInvoice = async (orderData) => {
  try {
    // Parse items if they're stored as a string
    let items = [];
    if (orderData.items) {
      if (typeof orderData.items === "string") {
        items = JSON.parse(orderData.items);
      } else {
        items = orderData.items;
      }
    } else if (orderData.cartItems) {
      items = orderData.cartItems;
    }

    // Parse address if it's stored as a string
    let address = {};
    if (orderData.address) {
      if (typeof orderData.address === "string") {
        address = JSON.parse(orderData.address);
      } else {
        address = orderData.address;
      }
    } else if (orderData.addressInfo) {
      address = orderData.addressInfo;
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    // Get shipping cost
    const shipping = orderData.shippingCost || (subtotal >= 99 ? 0 : 25); // Default shipping logic

    // Calculate total
    const total = subtotal + shipping;

    // Create invoice data
    const data = {
      // Company info
      sender: {
        company: "FreshGroce",
        address: "Hig-7 ,Rajeev gandhi nagar colony, Anand nagar",
        zip: "462022",
        city: "Bhopal",
        country: "India",
        email: "support@freshgroce.com",
        phone: "+91 7771040074",
      },
      // Client info
      client: {
        company: address.name || "Customer",
        address: address.address || "N/A",
        zip: address.pincode || "N/A",
        city: "",
        country: "India",
        phone: address.phoneNumber || orderData.phoneNumber || "N/A",
      },
      information: {
        number: orderData.$id || ID.unique(),
        date:
          orderData.date ||
          orderData.orderDate ||
          new Date().toLocaleDateString(),
        "due-date":
          orderData.date ||
          orderData.orderDate ||
          new Date().toLocaleDateString(),
      },
      products: items.map((item) => ({
        quantity: item.quantity,
        description: item.title,
        price: parseFloat(item.price),
        "tax-rate": 0,
      })),
      // Add shipping as a line item to ensure it appears in the invoice
      products: [
        ...items.map((item) => ({
          quantity: item.quantity,
          description: item.title,
          price: parseFloat(item.price),
          "tax-rate": 0,
        })),
        {
          quantity: null,
          description: "Shipping Fee" + (shipping === 0 ? " (Free)" : ""),
          price: shipping,
          "tax-rate": 0,
        },
      ],
      // We'll remove this since we're including shipping as a line item
      // shipping: shipping,
      "bottom-notice": "Thank you for shopping with FreshGroce!",
      settings: {
        currency: "INR",
        "tax-notation": "GST",
        "margin-top": 50,
        "margin-right": 50,
        "margin-left": 50,
        "margin-bottom": 25,
      },
    };

    // Generate the invoice as base64 string
    const result = await easyinvoice.createInvoice(data);
    const pdfBase64 = result.pdf;

    // Convert base64 string to Blob
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: "application/pdf" });

    // Create a File object from the Blob
    const invoiceFile = new File(
      [pdfBlob],
      `invoice-${orderData.$id || ID.unique()}.pdf`,
      {
        type: "application/pdf",
      }
    );

    // Upload the invoice to Appwrite Storage
    const uploadResult = await storage.createFile(
      INVOICE_BUCKET_ID,
      ID.unique(),
      invoiceFile
    );

    // Store the file ID
    const fileId = uploadResult.$id;

    // Create a download URL
    const fileUrl = storage.getFileDownload(INVOICE_BUCKET_ID, fileId);

    // Update the order with just the invoiceId field
    await databases.updateDocument(
      DATABASE_ID,
      ORDER_COLLECTION_ID,
      orderData.$id,
      {
        invoiceId: fileId, // Store just the file ID, not the full URL
      }
    );

    return {
      success: true,
      invoiceId: fileId,
      fileUrl: fileUrl,
    };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Download an invoice
 * @param {string} invoiceUrl - The URL or ID of the invoice to download
 * @param {string} orderId - The ID of the order
 */
export const downloadInvoice = (invoiceUrl, orderId) => {
  // Make sure we have a valid URL
  let downloadUrl = invoiceUrl;

  try {
    // If this is a file ID and not a URL, construct the download URL
    if (invoiceUrl && !invoiceUrl.startsWith("http")) {
      const urlParts = invoiceUrl.split("/");
      const fileId = urlParts[urlParts.length - 1];
      downloadUrl = storage.getFileDownload(INVOICE_BUCKET_ID, fileId);
    }

    // Create download link
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `FreshGroce-Invoice-${orderId || "order"}.pdf`;

    // This will force download instead of just viewing
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    // Try a direct window open as fallback
    window.open(downloadUrl, "_blank");
  }
};
