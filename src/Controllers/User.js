const db = require("../Database/database.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetLink = require("../utills/sendEmail.js");

 const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

     const existingUser = await db.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await db.one(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

 const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    const options = {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({ message: "User logged in successfully",token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "An error occurred while logging out" });
  }
};

 const getUsers = async (req, res) => {
  try {
    const users = await db.any(
      "SELECT id, name, email, role, created_at FROM users"
    );
    res.status(200).json({
      message: "All Users",
      users,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getSingleUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await db.oneOrNone(
        "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
        [id]
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(201).json({ message: "Uer details", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };
  
  // ✅ Delete User by ID
  const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await db.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      await db.none("DELETE FROM users WHERE id = $1", [id]);
  
      res.status(201).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };
  

 const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

     const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

     await db.none(
      "UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE email = $2",
      [hashedToken, email]
    );

    const emailResponse = await sendResetLink(resetToken, email);

    if (emailResponse.success) {
      return res.status(200).json({ message: "Reset link sent to Yur Email successfully!" });
    } else {
      return res.status(500).json({ message: "Failed to send reset link" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

 const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await db.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!user || !user.reset_token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

     const isValidToken = await bcrypt.compare(token, user.reset_token);
    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

     const hashedPassword = await bcrypt.hash(newPassword, 10);

     await db.none(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  forgetPassword,
  resetPassword,
  getSingleUser,
  deleteUser,
  logoutUser
};
