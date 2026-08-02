import { Router } from "express";

import { testDatabase } from "../controllers/dbTest.controller";

const router = Router();

router.get("/", testDatabase);

export default router;
