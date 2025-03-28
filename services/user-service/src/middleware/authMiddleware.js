const jwt = require("jsonwebtoken");
const { User } = require("../model/User.js");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'role'] 
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }

    req.user = { id: user.id, role: user.role }; 

    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'role']  
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user.id, role: user.role }; 

    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = {
  authMiddleware, 
  isLogin
};
