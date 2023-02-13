import { AuthenticatedRequest } from "@/middlewares";
import { bookingService } from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const booking = await bookingService.getBooking(userId)
        return res.status(httpStatus.OK).send(booking);
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
    }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;

    if (!roomId) return res.sendStatus(400);

    try {
        const bookingId = await bookingService.createBooking(userId, roomId)
        return res.status(httpStatus.OK).send({ bookingId })
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if (error.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
    }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;
    const bookingId = Number(req.params.bookingId)

    if (!roomId) return res.sendStatus(400);

    try {
        const newBookingId = await bookingService.changeBooking(userId, roomId, bookingId)
        return res.status(httpStatus.OK).send({ bookingId: newBookingId })
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if (error.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
    }
}