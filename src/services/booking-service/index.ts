import { notFoundError } from "@/errors"
import { bookingRepository } from "@/repositories/booking-repository"
import { roomRepository } from "@/repositories/room-repository.ts";
import hotelService from "../hotels-service";


async function getUserBooking(userId: number) {
    const booking = await bookingRepository.getUserBooking(userId);

    if (!booking) throw notFoundError();

    return booking;
}
async function getBooking(userId: number) {
    const booking = await getUserBooking(userId);

    return booking;
}

async function bookingValidations(userId: number, roomId: number) {
    const roomExist = await roomRepository.getRoomById(roomId)
    console.log(roomExist)
    if (!roomExist) throw notFoundError();

}

async function createBooking(userId: number, roomId: number) {
    await hotelService.listHotels(userId);
    await bookingValidations(userId, roomId);

    return
}

export const bookingService = {
    getBooking,
    createBooking
}