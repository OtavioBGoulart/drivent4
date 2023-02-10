import { notFoundError } from "@/errors"
import { bookingRepository } from "@/repositories/booking-repository"


async function getUserBooking(userId: number) {
    const booking = await bookingRepository.getUserBooking(userId);

    if (!booking) throw notFoundError();

    return booking;
}
async function getBooking(userId: number) {
    const booking = await getUserBooking(userId);

    return booking;
}

export const bookingService = {
    getBooking
}