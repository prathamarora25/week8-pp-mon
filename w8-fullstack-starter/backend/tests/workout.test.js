const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../config/db");
const Workout = require("../models/workoutModel");

const api = request(app);

const seedWorkouts = [
    {
        title: "Upper Body Blast",
        difficulty: "Beginner",
        description: "Upper body strength workout",
        price: 25,
    },
    {
        title: "Full Body Power",
        difficulty: "Intermediate",
        description: "Full body strength and cardio workout",
        price: 35,
    },
];

beforeAll(async () => {
    await connectDB();
});

beforeEach(async () => {
    await Workout.deleteMany({});
    await Workout.insertMany(seedWorkouts);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("GET /api/workouts", () => {
    describe("when workouts exist", () => {
        it("should return status 200", async () => {
            await api
                .get("/api/workouts")
                .expect(200);
        });

        it("should return all workouts", async () => {
            const response = await api.get("/api/workouts");

            expect(response.body).toHaveLength(seedWorkouts.length);
        });
    });
});

describe("POST /api/workouts", () => {
    describe("with valid workout data", () => {
        it("should return status 201", async () => {
            const newWorkout = {
                title: "Advanced Core",
                difficulty: "Advanced",
                description: "Intense core workout",
                price: 45,
            };

            await api
                .post("/api/workouts")
                .send(newWorkout)
                .expect(201);
        });

        it("should save the workout to the database", async () => {
            const newWorkout = {
                title: "Advanced Core",
                difficulty: "Advanced",
                description: "Intense core workout",
                price: 45,
            };

            await api
                .post("/api/workouts")
                .send(newWorkout);

            const workouts = await Workout.find({});

            expect(workouts).toHaveLength(seedWorkouts.length + 1);

            const savedWorkout = await Workout.findOne({
                title: "Advanced Core",
            });

            expect(savedWorkout).not.toBeNull();
            expect(savedWorkout.price).toBe(45);
        });
    });

    describe("with missing required data", () => {
        it("should return status 400", async () => {
            const invalidWorkout = {
                title: "Incomplete Workout",
                difficulty: "Beginner",
                description: "Missing price",
            };

            await api
                .post("/api/workouts")
                .send(invalidWorkout)
                .expect(400);
        });

        it("should not save the invalid workout to the database", async () => {
            const invalidWorkout = {
                title: "Incomplete Workout",
                difficulty: "Beginner",
                description: "Missing price",
            };

            await api
                .post("/api/workouts")
                .send(invalidWorkout);

            const workouts = await Workout.find({});

            expect(workouts).toHaveLength(seedWorkouts.length);
        });
    });
});

describe("GET /api/workouts/:workoutId", () => {
    describe("with an existing workout ID", () => {
        it("should return status 200", async () => {
            const workout = await Workout.findOne({});

            await api
                .get(`/api/workouts/${workout._id}`)
                .expect(200);
        });

        it("should return the correct workout", async () => {
            const workout = await Workout.findOne({
                title: "Upper Body Blast",
            });

            const response = await api
                .get(`/api/workouts/${workout._id}`);

            expect(response.body.title).toBe("Upper Body Blast");
            expect(response.body.difficulty).toBe("Beginner");
        });
    });

    describe("with a valid but non-existing workout ID", () => {
        it("should return status 404", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();

            await api
                .get(`/api/workouts/${nonExistingId}`)
                .expect(404);
        });
    });

    describe("with a malformed workout ID", () => {
        it("should return status 400", async () => {
            await api
                .get("/api/workouts/not-a-valid-id")
                .expect(400);
        });
    });
});

describe("PUT /api/workouts/:workoutId", () => {
    describe("with an existing workout ID", () => {
        it("should return status 200", async () => {
            const workout = await Workout.findOne({});

            const updatedWorkout = {
                title: "Updated Workout",
                difficulty: "Advanced",
                description: "Updated workout description",
                price: 50,
            };

            await api
                .put(`/api/workouts/${workout._id}`)
                .send(updatedWorkout)
                .expect(200);
        });

        it("should update the workout in the database", async () => {
            const workout = await Workout.findOne({});

            const updatedWorkout = {
                title: "Updated Workout",
                difficulty: "Advanced",
                description: "Updated workout description",
                price: 50,
            };

            await api
                .put(`/api/workouts/${workout._id}`)
                .send(updatedWorkout);

            const workoutInDatabase = await Workout.findById(workout._id);

            expect(workoutInDatabase.title).toBe("Updated Workout");
            expect(workoutInDatabase.difficulty).toBe("Advanced");
            expect(workoutInDatabase.price).toBe(50);
        });
    });

    describe("with a valid but non-existing workout ID", () => {
        it("should return status 404", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();

            await api
                .put(`/api/workouts/${nonExistingId}`)
                .send({
                    title: "Updated Workout",
                    difficulty: "Advanced",
                    description: "Updated description",
                    price: 50,
                })
                .expect(404);
        });
    });

    describe("with a malformed workout ID", () => {
        it("should return status 400", async () => {
            await api
                .put("/api/workouts/not-a-valid-id")
                .send({
                    title: "Updated Workout",
                    difficulty: "Advanced",
                    description: "Updated description",
                    price: 50,
                })
                .expect(400);
        });
    });
});

describe("DELETE /api/workouts/:workoutId", () => {
    describe("with an existing workout ID", () => {
        it("should return status 204", async () => {
            const workout = await Workout.findOne({});

            await api
                .delete(`/api/workouts/${workout._id}`)
                .expect(204);
        });

        it("should remove the workout from the database", async () => {
            const workout = await Workout.findOne({});

            await api.delete(`/api/workouts/${workout._id}`);

            const workouts = await Workout.find({});

            expect(workouts).toHaveLength(seedWorkouts.length - 1);

            const deletedWorkout = await Workout.findById(workout._id);
            expect(deletedWorkout).toBeNull();
        });
    });

    describe("with a valid but non-existing workout ID", () => {
        it("should return status 404", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();

            await api
                .delete(`/api/workouts/${nonExistingId}`)
                .expect(404);
        });
    });

    describe("with a malformed workout ID", () => {
        it("should return status 400", async () => {
            await api
                .delete("/api/workouts/not-a-valid-id")
                .expect(400);
        });
    });
});