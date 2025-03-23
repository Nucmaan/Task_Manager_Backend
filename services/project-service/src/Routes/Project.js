const { createProject, getAllProjects, getSingleProject, deleteProject, updateProject } = require('../Controllers/Project');
const { authMiddleware, isLogin } = require('../middleware/authMiddleware.js');
const Router = require('express').Router();
const { upload } = require('../middleware/uploadMiddleware.js'); 

Router.post('/createProject',isLogin,upload.single('project_image'), createProject);
Router.get('/allProjectList',authMiddleware,getAllProjects);
Router.get('/singleProject/:id',isLogin,getSingleProject);
Router.delete('/projectDelete/:id',isLogin,deleteProject);
Router.put('/updateProject/:id',isLogin,upload.single('project_image'),updateProject);

module.exports = Router
