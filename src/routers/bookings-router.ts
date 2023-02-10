import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .get("/booking")
    .post("/booking")
    .put("/booking")