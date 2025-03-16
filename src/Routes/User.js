const { registerUser, getUsers, loginUser, forgetPassword, resetPassword, getSingleUser, deleteUser, logoutUser } = require('../Controllers/User');
const { authMiddleware, isLogin } = require('../middleware/authMiddleware.js');

const Router = require('express').Router();

Router.post('/register', registerUser);
Router.post('/login', loginUser);
Router.get('/logout',logoutUser);
Router.get('/users',getUsers);
Router.get("/users/:id", getSingleUser);
Router.delete("/users/:id", deleteUser);
Router.post("/forgot-password", forgetPassword);
Router.post("/reset-password", resetPassword);

module.exports = Router

