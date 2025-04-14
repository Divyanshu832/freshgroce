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
      } else {
        // Store or update user data in localStorage
        // This ensures synchronization across browser sessions
        localStorage.setItem(
          "user",
          JSON.stringify({
            user: {
              uid: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
            },
          })
        );
      }

      return {
        success: true,
        data: currentUser,
        userInDb: userInDb.data,
      };
    }

    return {
      success: false,
      message: "No authenticated user found",
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify if user is authenticated
export const isAuthenticated = async () => {
  try {
    // First check if there's a valid Appwrite session
    const currentUser = await account.get();

    if (currentUser) {
      // If we have a valid session but localStorage doesn't match or is missing,
      // update localStorage to maintain consistency across browsers
      const localUser = localStorage.getItem("user");
      if (!localUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            user: {
              uid: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
            },
          })
        );
      }

      return {
        success: true,
        isAuthenticated: true,
        user: currentUser,
      };
    }

    return {
      success: false,
      isAuthenticated: false,
    };
  } catch (error) {
    // Handle permission-related errors (missing scope, unauthorized)
    console.error("Authentication check error:", error);

    // Check if it's a permission error that contains the specific missing scope message
    if (
      error.message &&
      (error.message.includes("missing scope") ||
        error.message.includes("Unauthorized") ||
        error.code === 401)
    ) {
      // Clear stale data from localStorage
      localStorage.removeItem("user");

      return {
        success: false,
        isAuthenticated: false,
        error: "Permission denied: " + error.message,
        isPermanentError: true, // Flag to indicate this is a configuration issue
      };
    }

    // For other errors, clean up and return appropriate response
    localStorage.removeItem("user");
    return {
      success: false,
      isAuthenticated: false,
      error: error.message,
    };
  }
};

// Synchronize user state with current session
export const synchronizeUserState = async () => {
  try {
    const currentUser = await account.get();

    if (currentUser) {
      // Update localStorage with current user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          user: {
            uid: currentUser.$id,
            email: currentUser.email,
            name: currentUser.name,
          },
        })
      );
      return {
        success: true,
        synchronized: true,
      };
    } else {
      // Remove user data if no session exists
      localStorage.removeItem("user");
      return {
        success: true,
        synchronized: false,
      };
    }
  } catch (error) {
    // Session doesn't exist or is invalid
    localStorage.removeItem("user");
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
    // First ensure localStorage is cleared immediately
    localStorage.clear(); // Clear all localStorage not just "user"

    try {
      // Then try to delete the Appwrite session
      // Changed from 'current' to using deleteSessions() which clears all sessions
      await account.deleteSessions();
    } catch (sessionError) {
      console.error("Error deleting session:", sessionError);
      // Continue with the logout flow even if session deletion fails
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error logging out:", error);
    // Make absolutely sure localStorage is cleared even if there were errors
    localStorage.clear();

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
