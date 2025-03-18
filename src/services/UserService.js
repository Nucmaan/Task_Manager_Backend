const UserDb = require("../Database/UserDb.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetLink = require("../utills/sendEmail.js");

const registerUser = async (name, email, password) => {
    const existingUser = await UserDb.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    return UserDb.one("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, hashedPassword]);
};

const loginUser = async (email, password) => {
    const user = await UserDb.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "5h" });
    return { token, user };
};

const getUsers = async () => {
    return UserDb.any("SELECT id, name, email, role, profile_image, created_at FROM users");
};

const getSingleUser = async (id) => {
    const user = await UserDb.oneOrNone("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id]);
    if (!user) throw new Error("User not found");
    return user;
};

const deleteUser = async (id) => {
    const user = await UserDb.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
    if (!user) throw new Error("User not found");
    await UserDb.none("DELETE FROM users WHERE id = $1", [id]);
};

const updateUser = async (id, updateFields) => {
    const user = await UserDb.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
    if (!user) throw new Error("User not found");

    const updateKeys = Object.keys(updateFields).map((key, index) => `${key} = $${index + 1}`).join(", ");
    const updateValues = [...Object.values(updateFields), id];

    return UserDb.none(`UPDATE users SET ${updateKeys} WHERE id = $${updateValues.length}`, updateValues);
};

const forgetPassword = async (email) => {
    const user = await UserDb.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await UserDb.none("UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE email = $2", [hashedToken, email]);

    const emailResponse = await sendResetLink(resetToken, email);
    if (!emailResponse.success) throw new Error("Failed to send reset link");
};

const resetPassword = async (email, token, newPassword) => {
    const user = await UserDb.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
    if (!user || !user.reset_token || !(await bcrypt.compare(token, user.reset_token))) {
        throw new Error("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserDb.none("UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2", [hashedPassword, email]);
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
