import { Router } from "express";
import {createIssue, getUserIssues, updateIssue,deleteIssue} from "../controllers/issues.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route('/createIssue').post(verifyJWT,createIssue);
router.route('/getIssues').get(verifyJWT,getUserIssues);
router.route('/updateIssue/:id').put(verifyJWT,updateIssue);
router.route('/deleteIssue/:id').delete(verifyJWT,deleteIssue);
export default router;