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

// Handle the post-OAuth user data storage
export const handleOAuthCallback = async () => {
  try {
    // Check if we have a valid session after OAuth redirect
    const currentUser = await account.get();

    if (currentUser) {
      // Prepare user data for database
      const userData = {
        name: currentUser.name || currentUser.email.split("@")[0],
        email: currentUser.email,
      };

      // First check if user already exists in the database
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID
      );

      // Check if user already exists by email
      const existingUser = existingUsers.documents.find(
        (user) => user.email === currentUser.email
      );

      let userInDb;
      if (existingUser) {
        // User exists, no need to update since we only have name and email fields
        userInDb = { data: existingUser };
        console.log("User already exists in database:", existingUser.$id);
      } else {
        // User doesn't exist, create a new user in database
        try {
          // Only include fields that exist in your schema
          const newUserData = {
            email: userData.email,
            name: userData.name,
          };

          userInDb = await databases.createDocument(
            DATABASE_ID,
            USER_COLLECTION_ID,
            ID.unique(),
            newUserData
          );
          console.log("New user created in database:", userInDb.$id);
        } catch (createError) {
          console.error("Error creating new user:", createError);
          // Continue without storing in DB, but log the error
        }
      }

      // Ensure admin status is checked
      const adminStatus = await isUserAdmin();

      // Store user data in localStorage with admin status
      localStorage.setItem(
        "user",
        JSON.stringify({
          user: {
            uid: currentUser.$id,
            email: currentUser.email,
            name: currentUser.name || userData.name,
            isAdmin: adminStatus.success && adminStatus.isAdmin,
          },
        })
      );

      // Notify components about auth state change
      notifyAuthStateChanged({
        uid: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name || userData.name,
        isAdmin: adminStatus.success && adminStatus.isAdmin,
      });

      return {
        success: true,
        data: currentUser,
        userInDb: userInDb || { data: null },
      };
    }

    return {
      success: false,
      message: "No user found after OAuth callback",
    };
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Email OTP Authentication Functions

// Send Magic URL or OTP to email for passwordless authentication
export const sendEmailOTP = async (email) => {
  try {
    // Create a magic URL token using the correct method
    const result = await account.createMagicURLToken(
      ID.unique(),
      email,
      window.location.origin + "/verify-otp" // Redirect URL after email is clicked
    );

    return {
      success: true,
      message: "OTP sent to your email successfully",
      data: result, // Include token data in response
    };
  } catch (error) {
    console.error("Error sending email OTP:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify the OTP or magic URL session
export const verifyEmailOTP = async (userId, secret) => {
  try {
    // Create a session with the magic URL token
    await account.createSession(userId, secret);

    // After successful verification, get current user
    const currentUser = await account.get();

    if (currentUser) {
      // Create or get existing user in database
      const userData = {
        name: currentUser.name || currentUser.email.split("@")[0], // Use email prefix as name if name is not available
        email: currentUser.email,
      };

      const userInDb = await createUser(userData);

      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          user: {
            uid: currentUser.$id,
            email: currentUser.email,
            name: currentUser.name || userData.name,
          },
        })
      );

      return {
        success: true,
        data: currentUser,
        userInDb: userInDb.data,
      };
    }

    return {
      success: false,
      message: "Failed to get user after verification",
    };
  } catch (error) {
    console.error("Error verifying email OTP:", error);
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

// Function to notify all components of auth state changes
export const notifyAuthStateChanged = (user = null) => {
  // Create and dispatch a custom event that components can listen for
  const authEvent = new CustomEvent("auth-state-changed", {
    detail: { user, timestamp: Date.now() },
  });
  window.dispatchEvent(authEvent);

  // Also trigger storage event for cross-tab communication
  try {
    // This is a hack to trigger storage events in the same tab
    const tempValue = localStorage.getItem("auth-timestamp") || "0";
    localStorage.setItem("auth-timestamp", Date.now().toString());
    setTimeout(() => {
      localStorage.setItem("auth-timestamp", tempValue);
    }, 100);
  } catch (e) {
    console.error("Error triggering storage event:", e);
  }
};

// Synchronize user state with current session
export const synchronizeUserState = async () => {
  try {
    const currentUser = await account.get();

    if (currentUser) {
      // Check if the user is an admin
      let isAdmin = false;
      try {
        const adminResult = await isUserAdmin();
        isAdmin = adminResult.success && adminResult.isAdmin;
      } catch (adminError) {
        console.error("Error checking admin status during sync:", adminError);
      }

      // Update localStorage with current user data and admin status
      const userData = {
        user: {
          uid: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
          isAdmin: isAdmin, // Include admin status
        },
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Notify all components about the state change
      notifyAuthStateChanged(userData.user);

      return {
        success: true,
        synchronized: true,
        isAdmin,
        user: userData.user,
      };
    } else {
      // Remove user data if no session exists
      localStorage.removeItem("user");
      notifyAuthStateChanged(null);
      return {
        success: true,
        synchronized: false,
      };
    }
  } catch (error) {
    // Session doesn't exist or is invalid
    localStorage.removeItem("user");
    notifyAuthStateChanged(null);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create a user in the database
export const createUser = async (userData) => {
  try {
    if (!userData || !userData.email) {
      console.error("Cannot create user: Missing email");
      return { success: false, error: "Missing required user data (email)" };
    }

    console.log(
      "Attempting to create/verify user in database:",
      userData.email
    );

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
        // User already exists, no need to update since we only have name and email
        console.log("User already exists in database:", existingUser.$id);
        return {
          success: true,
          data: existingUser,
          message: "User already exists",
        };
      }

      // Create new user with only name and email fields
      const documentData = {
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
      };

      // Create the document with a unique ID
      const newUser = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        ID.unique(),
        documentData
      );

      console.log("New user created in database:", newUser.$id);

      return {
        success: true,
        data: newUser,
        message: "New user created successfully",
      };
    } catch (dbError) {
      console.error("Database operation error:", dbError);

      // Return a partial success to prevent blocking the auth flow
      return {
        success: false,
        error: dbError.message,
        message:
          "Failed to interact with the database, but authentication succeeded",
      };
    }
  } catch (error) {
    console.error("Error in createUser function:", error);
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

    // Try fallback method - check if admin status is stored in localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData && userData.user && userData.user.isAdmin) {
          return {
            success: true,
            isAdmin: true,
            source: "localStorage",
          };
        }
      }
    } catch (localStorageError) {
      console.error("Error reading from localStorage:", localStorageError);
    }

    return {
      success: false,
      isAdmin: false,
      error: error.message,
    };
  }
};
