const Router = require("express").Router;
const router = new Router();

const taskController = require("../controller/task-controller");
const listController = require("../controller/list-controller");
const userController = require("../controller/user-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", authMiddleware, userController.logout);
router.post("/me", authMiddleware, userController.getUser);
router.post("/refresh", userController.refresh);
router.post("/sendChangeLink", userController.sendChangePasswordLink);
router.post("/changePassword", userController.changePassword);
router.get("/activate/:link", userController.activate);

router.post("/create/list", listController.createList);
router.post("/delete/list", listController.deleteList);
router.post("/create/generalLists", listController.createGeneralLists);
router.post("/get/list", listController.getList);

router.post("/create/task", taskController.createTask);
router.post("/delete/task", taskController.deleteTask);
router.post("/update/task", taskController.updateTask);
router.post("/getToday/task", taskController.getTodayTasks);
router.post("/getPlanned/task", taskController.getPlannedTasks);
router.post("/getAll/task", taskController.getAllTasks);
router.post("/get/task", taskController.getTask);

module.exports = router;
