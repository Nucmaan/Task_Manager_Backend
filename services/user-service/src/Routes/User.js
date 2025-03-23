const { registerUser, getUsers, loginUser, forgetPassword, resetPassword, getSingleUser, deleteUser, logoutUser, updateUser } = require('../Controllers/User');
const { authMiddleware, isLogin } = require('../middleware/authMiddleware.js');

const Router = require('express').Router();
const { upload } = require('../middleware/uploadMiddleware.js'); 
 

Router.post('/register', registerUser);
Router.post('/login', loginUser);
Router.get('/logout',logoutUser);
Router.get('/users',authMiddleware,getUsers);
Router.get("/users/:id",isLogin,getSingleUser);
Router.delete("/users/:id",authMiddleware,deleteUser);
Router.put("/users/:id",isLogin,upload.single('profileImage'),updateUser);
Router.post("/forgot-password", forgetPassword);
Router.post("/reset-password", resetPassword);

module.exports = Router

