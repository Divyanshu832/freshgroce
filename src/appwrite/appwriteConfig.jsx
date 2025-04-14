import {
  Client,
  Account,
  Databases,
  Teams,
  ID,
  Query,
  Storage,
} from "appwrite";

// Initialize Appwrite Client
const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Set your Appwrite endpoint
  .setProject("67fb817600293758bd67"); // Set your project ID

// Initialize Appwrite Account
const account = new Account(client);

// Initialize Appwrite Database
const databases = new Databases(client);

// Initialize Appwrite Teams
const teams = new Teams(client);

// Initialize Appwrite Storage
const storage = new Storage(client);

// Database and Collection IDs
const DATABASE_ID = "67fb81a90023a6eaa1d7";

// IMPORTANT: Replace these placeholder IDs with the actual collection IDs from your Appwrite dashboard
// Format should be something like "67fb81c80029835fdff9" not just "users"
const USER_COLLECTION_ID = "67fb81e2001e5e1090b4"; // Replace with actual ID from Appwrite dashboard
const PRODUCT_COLLECTION_ID = "67fb81f2002467d7cc17"; // Replace with actual ID from Appwrite dashboard
const ORDER_COLLECTION_ID = "67fb81fa0007b55c30f8"; // Replace with actual ID from Appwrite dashboard
const REVIEW_COLLECTION_ID = "67fbe45c000c6f59cd22"; // Replace with actual ID once created in Appwrite dashboard
const FLASH_SALE_COLLECTION_ID = "67fc3bbf003b9a497f58"; // Replace with the actual ID once you create the collection

// Storage bucket ID for invoices
const INVOICE_BUCKET_ID = "67fd3f500028ac32ff59"; // Replace with actual bucket ID once created

export {
  client,
  account,
  databases,
  teams,
  storage,
  DATABASE_ID,
  USER_COLLECTION_ID,
  PRODUCT_COLLECTION_ID,
  ORDER_COLLECTION_ID,
  REVIEW_COLLECTION_ID,
  FLASH_SALE_COLLECTION_ID,
  INVOICE_BUCKET_ID,
  ID,
  Query,
};
