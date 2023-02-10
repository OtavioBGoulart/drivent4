import { createBooking, getBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .get("/", getBooking)
    .post("/", createBooking)
    .put("/")

export { bookingRouter }