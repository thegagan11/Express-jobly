// routes/jobs.test.js

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Job = require("../models/job");
const { createTestJob, testJobIds } = require("./_testCommon"); // Adjust to your test setup

beforeAll(async () => {
    await db.connect();
});

beforeEach(async () => {
    await createTestJob(); // Create some test jobs
});

afterEach(async () => {
    await db.query("DELETE FROM jobs");
});

afterAll(async () => {
    await db.end();
});

describe("POST /jobs", () => {
    test("Can create a new job with admin", async () => {
        const response = await request(app)
            .post("/jobs")
            .send({
                title: "New Job",
                salary: 60000,
                equity: "0.1",
                companyHandle: "testCompany"
            })
            .set("Authorization", `Bearer ${adminToken}`); // Replace with your token logic

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            job: expect.any(Object) // Adjust expectations as needed
        });
    });

    // Add more test cases as needed
});

describe("GET /jobs", () => {
    test("Can get a list of jobs", async () => {
        const response = await request(app).get("/jobs");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            jobs: expect.any(Array) // Adjust expectations as needed
        });
    });

    // Add more test cases as needed
});

describe("GET /jobs/:id", () => {
    test("Can get a job by id", async () => {
        const job = await Job.create({ /* job data */ }); // Create a job to get
        const response = await request(app).get(`/jobs/${job.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            job: expect.any(Object) // Adjust expectations as needed
        });
    });

    // Add more test cases as needed
});

describe("PATCH /jobs/:id", () => {
    test("Can update a job with admin", async () => {
        const job = await Job.create({ /* job data */ }); // Create a job to update
        const response = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({ title: "Updated Job Title" })
            .set("Authorization", `Bearer ${adminToken}`); // Replace with your token logic

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            job: expect.any(Object) // Adjust expectations as needed
        });
    });

    // Add more test cases as needed
});

describe("DELETE /jobs/:id", () => {
    test("Can delete a job with admin", async () => {
        const job = await Job.create({ /* job data */ }); // Create a job to delete
        const response = await request(app)
            .delete(`/jobs/${job.id}`)
            .set("Authorization", `Bearer ${adminToken}`); // Replace with your token logic

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            deleted: job.id
        });
    });

    // Add more test cases as needed
});
