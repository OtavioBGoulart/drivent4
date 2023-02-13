import { prisma } from "@/config"


async function getUserBooking(userId: number) {

    return prisma.booking.findFirst({
        where: {
            userId
        },
        select: {
            id: true,
            Room: true
        }
    })
}

async function getBookings(roomId: number) {

    return prisma.booking.findMany({
        where: {
            roomId
        },

    })
}

export async function createBooking(userId: number, roomId: number) {

    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

export async function deleteBooking(bookingId: number, userId: number) {

    return prisma.booking.deleteMany({
        where: {
            AND: [
                { id: bookingId },
                { userId: userId }
            ]
        }
    })
}

export const bookingRepository = {
    getUserBooking,
    getBookings,
    createBooking,
    deleteBooking
}