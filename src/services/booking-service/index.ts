import { notFoundError } from "@/errors"
import { bookingRepository } from "@/repositories/booking-repository"


async function getUserBooking(userId: number) {
    const booking = await bookingRepository.getUserBooking(userId)

    if (!booking) throw notFoundError()
}
async function getBooking(userId: number) {
    await
}

export const bookingService = {
    getBooking
}