import {
  account,
  databases,
  teams,
  DATABASE_ID,
  USER_COLLECTION_ID,
  ID,
  Query,
} from "./appwriteConfig";

// Function to authenticate with Google
export const signInWithGoogle = async () => {
  try {
    // Create OAuth session with Google
    const session = await account.createOAuth2Session(
      "google",
      window.location.origin, // Success URL - redirect back to the app after successful login
      window.location.origin + "/login" // Failure URL - redirect to login page if authentication fails
    );

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get the current user and ensure they exist in the database
export const getCurrentUser = async () => {
  try {
    const currentUser = await account.get();

    if (currentUser) {
      // User exists in Appwrite auth, now ensure they exist in the database
      const userData = {
        name: currentUser.name,
        email: currentUser.email,
      };

      // Create or get existing user in database
      const userInDb = await createUser(userData);

      if (!userInDb.success) {
        console.error("Failed to create user in database:", userInDb.error);
      }

      return {
        success: true,
        data: currentUser,
        userInDb: userInDb.data,
      };
    }

    return {
      success: true,
      data: currentUser,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create a user in the database
export const createUser = async (userData) => {
  try {
    // First check if user exists in the database
    const existingUsers = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID
    );

    // Manually filter results by email
    const existingUser = existingUsers.documents.find(
      (user) => user.email === userData.email
    );

    if (existingUser) {
      // User already exists, return the existing user
      return {
        success: true,
        data: existingUser,
        message: "User already exists",
      };
    }

    try {
      // Create new user if not found
      // Define the document data based on available schema attributes
      const documentData = {};

      // Only add fields that exist in your schema
      // You can customize this based on your actual schema
      if (userData.name) documentData.name = userData.name;
      if (userData.email) documentData.email = userData.email;

      const newUser = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        ID.unique(),
        documentData
      );

      return {
        success: true,
        data: newUser,
      };
    } catch (permissionError) {
      console.error("Permission error:", permissionError);

      // If we get a permission error, create a user object locally
      // This is a workaround for demo purposes when database permissions aren't set up
      const tempUser = {
        $id: ID.unique(),
        email: userData.email,
      };

      // Only add name if it was provided
      if (userData.name) tempUser.name = userData.name;

      console.log(
        "Created temporary user due to permission issues. Please update Appwrite permissions."
      );

      return {
        success: true,
        data: tempUser,
        message: "Created temporary user (database write permission denied)",
      };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Delete the current session
    await account.deleteSession("current");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error logging out:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Function to check if a user is an admin (part of admin team)
export const isUserAdmin = async () => {
  try {
    // Define admin team ID
    const ADMIN_TEAM_ID = "67fbbeee00191c53eab4";

    // Get the list of teams the user is a member of
    const teamsList = await teams.list();

    // Check if the user is a member of the admin team
    const isAdmin = teamsList.teams.some((team) => team.$id === ADMIN_TEAM_ID);

    return {
      success: true,
      isAdmin,
    };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return {
      success: false,
      isAdmin: false,
      error: error.message,
    };
  }
};
