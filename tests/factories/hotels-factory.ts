import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoomWithHotelId(hotelId: number, capacity?: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: capacity || 1,
      hotelId: hotelId,
    }
  });
}

export async function createBookingWithRoomId(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  })
}
