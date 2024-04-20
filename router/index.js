const Router = require("express").Router;
const router = new Router();

const userController = require("../controller/user-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/me", authMiddleware, userController.getUser);
router.post("/refresh", userController.refresh);

module.exports = router;
