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
    
    const bookings = await bookingRepository.getBookings(roomId)
    console.log(bookings)
    if(roomExist.capacity === bookings.length) {
        throw forbidden();
    }

}

async function getBooking(userId: number) {
    const booking = await bookingRepository.getUserBooking(userId);
    if (!booking) throw notFoundError();

    return booking;
}



async function createBooking(userId: number, roomId: number) {
    await businessRules(userId)
    await bookingValidations(userId, roomId);
    const booking = await bookingRepository.createBooking(userId, roomId);

    return booking.id
}

async function changeBooking(userId: number, roomId: number, bookingId: number) {
    const booking = await bookingRepository.getUserBooking(userId);
    if (!booking) throw forbidden();

    await bookingValidations(userId, roomId);
    const delet =  await bookingRepository.deleteBooking(bookingId, userId)
    console.log("delete",delet)
    if (delet.count === 0) throw notFoundError();
    const newBooking = await bookingRepository.createBooking(userId, roomId);

    return newBooking.id
}

export const bookingService = {
    getBooking,
    createBooking,
    changeBooking
}