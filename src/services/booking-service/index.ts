import { forbidden, notFoundError } from "@/errors"
import { bookingRepository } from "@/repositories/booking-repository"
import enrollmentRepository from "@/repositories/enrollment-repository";
import { roomRepository } from "@/repositories/room-repository.ts";
import ticketRepository from "@/repositories/ticket-repository";


async function businessRules(userId: number) {
    
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw forbidden()
    }
    
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw forbidden();
    }
}

async function bookingValidations(userId: number, roomId: number) {
    const roomExist = await roomRepository.getRoomById(roomId)
    console.log(roomExist)
    if (!roomExist) throw notFoundError();

}

async function getBooking(userId: number) {
    const booking = await bookingRepository.getUserBooking(userId);

    if (!booking) throw notFoundError();

    return booking;
}



async function createBooking(userId: number, roomId: number) {
    await businessRules(userId)
    await bookingValidations(userId, roomId);

    return
}

async function changeBooking(userId: number, roomId: number, bookingId: number) {
    const booking = await bookingRepository.getUserBooking(userId);

    if (!booking) throw forbidden();

    await bookingValidations(userId, roomId);

    return
}

export const bookingService = {
    getBooking,
    createBooking,
    changeBooking
}