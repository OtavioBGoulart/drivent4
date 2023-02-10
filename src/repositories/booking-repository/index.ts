import { prisma } from "@/config"


async function getUserBooking(userId: number) {

    return prisma.booking.findFirst({
        where: {
            userId
        }
    })
}

export const bookingRepository = {
    getUserBooking
}