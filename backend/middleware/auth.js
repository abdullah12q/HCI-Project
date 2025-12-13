import admin from "firebase-admin";

const verifyToken = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = tokenHeader.split(" ")[1];

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the user info to the request object so controllers can use it
    req.user = decodedToken;

    next(); // Pass control to the next function (the controller)
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};

export default verifyToken;
