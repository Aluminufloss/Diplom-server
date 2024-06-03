const Router = require("express").Router;
const router = new Router();

const taskController = require("../controller/task-controller");
const listController = require("../controller/list-controller");
const userController = require("../controller/user-controller");
const groupController = require("../controller/group-controller");
const analyticsController = require("../controller/analytics-controller");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", authMiddleware, userController.logout);
router.get("/me", authMiddleware, userController.getUser);
router.post("/refresh", userController.refresh);
router.post("/sendChangeLink", userController.sendChangePasswordLink);
router.post("/changePassword", userController.changePassword);
router.get("/activate/:link", userController.activate);

router.post("/list", authMiddleware, listController.createList); 
router.delete("/list/:listId", authMiddleware, listController.deleteList); 
router.get("/list/:listId", listController.getList);
router.get("/lists", authMiddleware, listController.getLists);
router.get("/listName/:listId", authMiddleware, listController.getListName);
router.post("/listsNames", authMiddleware, listController.getAllListsNames);
router.get("/list/:listId/tasks", authMiddleware, listController.getTasksByListId);

router.post("/task", authMiddleware, taskController.createTask);
router.delete("/task/:taskId", authMiddleware, taskController.deleteTask);
router.put("/task/:taskId", authMiddleware, taskController.updateTask);
router.get("/tasks/today", authMiddleware, taskController.getTodayTasks);
router.get("/tasks/planned", authMiddleware, taskController.getPlannedTasks);
router.get("/tasks", authMiddleware, taskController.getAllTasks);
router.get("/task/:taskId", authMiddleware, taskController.getTask);
router.patch("/task/:taskId/status", authMiddleware, taskController.changeTaskStatus);

router.post("/group", authMiddleware, groupController.createGroup); 
router.delete("/group/:groupId", authMiddleware, groupController.deleteGroup);
router.patch("/group/:groupId/name", authMiddleware, groupController.updateGroupName);
router.patch("/group/:groupId/list", authMiddleware, groupController.addListToGroup); 
router.get("/groups", authMiddleware, groupController.getGroups);
router.get("/groups/names", authMiddleware, groupController.getGroupsNames); 
router.get("/group/:groupId/name", authMiddleware, groupController.getGroupName);
router.delete("/group/:groupId/list", authMiddleware, groupController.removeListFromGroup);

router.get("/analytics", authMiddleware, analyticsController.getAllAnalytics); 
router.get("/analytics/week", authMiddleware, analyticsController.getComparisonAnalyticsByWeek); 
router.get("/analytics/month", authMiddleware, analyticsController.getComparisonAnalyticsByMonth); 
router.get("/analytics/year", authMiddleware, analyticsController.getComparisonAnalyticsByYear); 

module.exports = router;
