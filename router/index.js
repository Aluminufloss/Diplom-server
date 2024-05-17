const Router = require("express").Router;
const router = new Router();

const taskController = require("../controller/task-controller");
const listController = require("../controller/list-controller");
const userController = require("../controller/user-controller");
const groupController = require("../controller/group-controller");
const analyticsController = require("../controller/analytics-controller");
const notificationController = require("../controller/notification-controller");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", authMiddleware, userController.logout);
router.post("/me", authMiddleware, userController.getUser);
router.post("/refresh", userController.refresh);
router.post("/sendChangeLink", userController.sendChangePasswordLink);
router.post("/changePassword", userController.changePassword);
router.get("/activate/:link", userController.activate);

router.post("/create/list", authMiddleware, listController.createList);
router.post("/delete/list", authMiddleware, listController.deleteList);
router.post("/create/generalLists", listController.createGeneralLists);
router.post("/get/list", listController.getList);
router.post("/get/lists", authMiddleware, listController.getLists);
router.post("/get/listName", listController.getListName);
router.post("/getAll/listsName", listController.getAllListsNames);
router.post("/getTasksByListId/list", authMiddleware, listController.getTasksByListId
);

router.post("/create/task", authMiddleware, taskController.createTask);
router.post("/delete/task", authMiddleware, taskController.deleteTask);
router.post("/update/task", authMiddleware, taskController.updateTask);
router.post("/getToday/task", authMiddleware, taskController.getTodayTasks);
router.post("/getPlanned/task", authMiddleware, taskController.getPlannedTasks);
router.post("/getAll/task", authMiddleware, taskController.getAllTasks);
router.post("/get/task", authMiddleware, taskController.getTask);
router.post("/changeStatus/task", authMiddleware, taskController.changeTaskStatus);

router.post("/create/group", authMiddleware, groupController.createGroup);
router.post("/delete/group", authMiddleware, groupController.deleteGroup);
router.post("/updateName/group", authMiddleware, groupController.updateGroupName);
router.post("/addList/group", authMiddleware, groupController.addListToGroup);
router.post("/getGroups/group", authMiddleware, groupController.getGroups);
router.post("/getGroupsNames/group", authMiddleware, groupController.getGroupsNames);
router.post("/getGroupName/group", authMiddleware, groupController.getGroupName);
router.post( "/removeList/group", authMiddleware, groupController.removeListFromGroup);

router.post("/getAll/analytics", authMiddleware, analyticsController.getAllAnalytics);
router.post("/getAnalyticsByList/analytics", authMiddleware, analyticsController.getAnaliticsByList);
router.post("/getAnalyticsByGroup/analytics", authMiddleware, analyticsController.getAnaliticsByGroup);
router.post("/getAnalyticsByWeek/analytics", authMiddleware, analyticsController.getComparisonAnalyticsByWeek);
router.post("/getAnalyticsByMonth/analytics", authMiddleware, analyticsController.getComparisonAnalyticsByMonth);

router.post("/create/notification", notificationController.createNotification);
router.post("/delete/notification", notificationController.deleteNotification);
router.post("/get/notification", notificationController.getNotification);
router.get("/getAll/notification", notificationController.getAllNotifications);
router.post("/update/notification", notificationController.updateNotification);

module.exports = router;