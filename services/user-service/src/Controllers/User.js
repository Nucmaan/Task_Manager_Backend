const UserService = require("../Services/UserService.js");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserService.registerUser(name, email, password);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await UserService.loginUser(email, password);

        res.status(200)
            .cookie("token", token, { expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), httpOnly: true })
            .json({ message: "User logged in successfully", token, user });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await UserService.getUsers();
        res.status(200).json({ message: "All Users", users });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};

const getSingleUser = async (req, res) => {
    try {
        const user = await UserService.getSingleUser(req.params.id);
        res.status(200).json({ message: "User details", user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await UserService.deleteUser(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        await UserService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const forgetPassword = async (req, res) => {
    try {
        await UserService.forgetPassword(req.body.email);
        res.status(200).json({ message: "Reset link sent to your email successfully!" });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        await UserService.resetPassword(req.body.email, req.body.token, req.body.newPassword);
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while logging out" });
    }
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
    logoutUser
};
