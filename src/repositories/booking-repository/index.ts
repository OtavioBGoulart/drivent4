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

export const bookingRepository = {
    getUserBooking,
    getBookings
}