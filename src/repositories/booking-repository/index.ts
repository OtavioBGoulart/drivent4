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

export const bookingRepository = {
    getUserBooking
}