const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetLink = require("../utills/sendEmail.js");
const User = require("../model/User.js");
const fs = require("fs");
const path = require("path");

const registerUser = async (name, email, password, mobile) => {
  try {
    console.log("Received Data:", { name, email, password, mobile });

    if (!name || !email || !password || !mobile) {
      return {
        success: false,
        message: "All fields are required: name, email, password, and mobile.",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters long.",
      };
    }

    const mobileRegex = /^[0-9+\-()\s]{5,13}$/;
    if (!mobileRegex.test(mobile)) {
      return { success: false, message: "Invalid mobile number format." };
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        message: "User already exists with this email.",
      };
    }

    const existingMobile = await User.findOne({ where: { mobile } });
    if (existingMobile) {
      return { success: false, message: "Mobile number already registered." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "User",
    });

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        created_at: newUser.created_at,
      },
    };
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    return { success: false, message: error.message };
  }
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  return { token, user };
};

const getUsers = async () => {
  return await User.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "mobile",
      "role",
      "profile_image",
      "created_at",
    ],
  });
};

const getSingleUser = async (id) => {
  const user = await User.findOne({
    where: { id },
    attributes: [
      "id",
      "name",
      "email",
      "mobile",
      "role",
      "profile_image",
      "created_at",
    ],
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findOne({ where: { id } });
  if (!user) throw new Error("User not found");
  await user.destroy();
};

const updateUser = async (id, updateFields, file) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  if (file) {
    const oldImagePath = user.profile_image;
    if (oldImagePath) {
      const oldImageFilename = oldImagePath.split("/public/")[1];
      const absoluteOldImagePath = path.join(
        __dirname,
        "../public",
        oldImageFilename
      );
      fs.unlink(absoluteOldImagePath);
      updateFields.profile_image = `/public/${file.filename}`;
    }
  }
  await user.update(updateFields);

  return user;
};

const forgetPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);

  await user.update({
    reset_token: hashedToken,
    reset_token_expires: new Date(Date.now() + 60 * 60 * 1000),
  });

  const emailResponse = await sendResetLink(resetToken, email);
  if (!emailResponse.success) throw new Error("Failed to send reset link");
};

const resetPassword = async (email, token, newPassword) => {
  const user = await User.findOne({ where: { email } });

  if (
    !user ||
    !user.reset_token ||
    !(await bcrypt.compare(token, user.reset_token)) ||
    user.reset_token_expires < new Date()
  ) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({
    password: hashedPassword,
    reset_token: null,
    reset_token_expires: null,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword,
};
