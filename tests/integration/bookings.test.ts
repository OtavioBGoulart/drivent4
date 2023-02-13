import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createUser, createTicketTypeWithHotel, createHotel, createTicket, createRoomWithHotelId, createBookingWithRoomId, createTicketTypeRemote, createTicketType } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    })

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when user doesnt have an booking yet", async () => {
            const token = await generateValidToken();

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 200 when get the user booking was sucessfull", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotels = await createHotel();
            const room = await createRoomWithHotelId(hotels.id)
            const booking = await createBookingWithRoomId(room.id, user.id)

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                {
                    id: booking.id,
                    Room: {
                        id: room.id,
                        name: room.name,
                        capacity: 1,
                        hotelId: hotels.id,
                        createdAt: room.createdAt.toISOString(),
                        updatedAt: room.updatedAt.toISOString()
                    }
                }
            )
        })
    })
})


describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.post("/booking").send({});

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    })

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
            const token = await generateValidToken();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user doesnt have a ticket yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
      
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
          });
        
        it("should respond with status 403 when user didnt paid for the ticket yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with status 403 when event is remote or doenst include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with status 404 when roomId was not found", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotels = await createHotel();
            const room = await createRoomWithHotelId(hotels.id)
            
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id + 1});

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it("should respond with status 403 when it has no vacancies in the room", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotels = await createHotel();
            const room = await createRoomWithHotelId(hotels.id);
            await createBookingWithRoomId(room.id, user.id)
            
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with status 200 when create a booking", async () => {
            const user = await createUser();
            const nextUser = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotels = await createHotel();
            const room = await createRoomWithHotelId(hotels.id, 2);
            await createBookingWithRoomId(room.id, nextUser.id)

            
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({ bookingId: expect.any(Number) })
        })
    })
})

// describe("POST /booking", () => {
//     it("should respond with status 401 if no token is given", async () => {
//         const response = await server.post("/booking").send({});

//         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//     })

//     it("should respond with status 401 if given token is not valid", async () => {
//         const token = faker.lorem.word();

//         const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

//         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//     });

//     it("should respond with status 401 if there is no session for given token", async () => {
//         const userWithoutSession = await createUser();
//         const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

//         const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

//         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//     });

//     describe("when token is valid", () => {
//         it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
//             const token = await generateValidToken();

//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

//             expect(response.status).toEqual(httpStatus.FORBIDDEN);
//         });

//         it("should respond with status 403 when user doesnt have a ticket yet", async () => {
//             const user = await createUser();
//             const token = await generateValidToken(user);
//             await createEnrollmentWithAddress(user);
      
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});
      
//             expect(response.status).toEqual(httpStatus.FORBIDDEN);
//           });
        
//         it("should respond with status 403 when user didnt paid for the ticket yet", async () => {
//             const user = await createUser();
//             const token = await generateValidToken(user);
//             const enrollment = await createEnrollmentWithAddress(user);
//             const ticketType = await createTicketTypeWithHotel();
//             await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

//             expect(response.status).toBe(httpStatus.FORBIDDEN);
//         })

//         it("should respond with status 403 when event is remote or doenst include hotel", async () => {
//             const user = await createUser();
//             const token = await generateValidToken(user);
//             const enrollment = await createEnrollmentWithAddress(user);
//             const ticketType = await createTicketTypeRemote();
//             await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: faker.datatype.number(100)});

//             expect(response.status).toBe(httpStatus.FORBIDDEN);
//         })

//         it("should respond with status 404 when roomId was not found", async () => {
//             const user = await createUser();
//             const token = await generateValidToken(user);
//             const enrollment = await createEnrollmentWithAddress(user);
//             const ticketType = await createTicketTypeWithHotel();
//             await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
//             const hotels = await createHotel();
//             const room = await createRoomWithHotelId(hotels.id)
            
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id + 1});

//             expect(response.status).toBe(httpStatus.NOT_FOUND);
//         })

//         it("should respond with status 403 when it has no vacancies in the room", async () => {
//             const user = await createUser();
//             const token = await generateValidToken(user);
//             const enrollment = await createEnrollmentWithAddress(user);
//             const ticketType = await createTicketTypeWithHotel();
//             await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
//             const hotels = await createHotel();
//             const room = await createRoomWithHotelId(hotels.id);
//             await createBookingWithRoomId(room.id, user.id)
            
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

//             expect(response.status).toBe(httpStatus.FORBIDDEN);
//         })

//         it("should respond with status 200 when create a booking", async () => {
//             const user = await createUser();
//             const nextUser = await createUser();
//             const token = await generateValidToken(user);
//             const enrollment = await createEnrollmentWithAddress(user);
//             const ticketType = await createTicketTypeWithHotel();
//             await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
//             const hotels = await createHotel();
//             const room = await createRoomWithHotelId(hotels.id, 2);
//             await createBookingWithRoomId(room.id, nextUser.id)

            
//             const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

//             expect(response.status).toBe(httpStatus.OK);
//         })
//     })
// })
