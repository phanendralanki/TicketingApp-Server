import { Router } from "express";
import {createIssue, getUserIssues} from "../controllers/issues.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route('/createIssue').post(verifyJWT,createIssue);
router.route('/getIssues').get(verifyJWT,getUserIssues);

export default router;