const Router = require("express").Router;
const router = new Router();

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

module.exports = router;
