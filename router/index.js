const Router = require("express").Router;
const router = new Router();

const taskController = require("../controller/task-controller");
const listController = require("../controller/list-controller");
const userController = require("../controller/user-controller");
const groupController = require("../controller/group-controller");

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
router.post("/get/listName", listController.getListName);

router.post("/create/task", taskController.createTask);
router.post("/delete/task", taskController.deleteTask);
router.post("/update/task", taskController.updateTask);
router.post("/getToday/task", taskController.getTodayTasks);
router.post("/getPlanned/task", taskController.getPlannedTasks);
router.post("/getAll/task", taskController.getAllTasks);
router.post("/get/task", taskController.getTask);
router.post("/changeStatus/task", taskController.changeTaskStatus);

router.post("/create/group", groupController.createGroup);
router.post("/delete/group", groupController.deleteGroup);
router.post("/updateName/group", groupController.updateGroupName);
router.post("/addList/group", groupController.addListToGroup);
router.post("/removeList/group", groupController.removeListFromGroup);

// router.post("/create/notification", notificationController.createNotification);
// router.post("/delete/notification", notificationController.deleteNotification);
// router.post("/get/notification", notificationController.getNotifications);
// router.get("/getAll/notification", notificationController.getAllNotifications);

module.exports = router;
