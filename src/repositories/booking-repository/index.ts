import { prisma } from "@/config"


async function getUserBooking(userId: number) {

    return prisma.booking.findFirst({
        where: {
            userId
        },
        include: {
            Room: true
        }
    })
}

export const bookingRepository = {
    getUserBooking
}