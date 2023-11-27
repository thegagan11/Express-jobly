// job.test.js

const db = require("../db");
const Job = require("../models/job");
const { createTestJob, testJobIds } = require("./_testCommon");

beforeAll(async () => {
    await db.connect();
});

beforeEach(async () => {
    await createTestJob(); // A helper function to create test data
});

afterEach(async () => {
    await db.query("DELETE FROM jobs");
});

afterAll(async () => {
    await db.end();
});

describe("Test Job model", () => {

    /** Test for creating a job */
    test("Can create a job", async () => {
        const newJob = await Job.create({
            title: "New Job",
            salary: 50000,
            equity: "0",
            companyHandle: "testCompany"
        });

        expect(newJob).toHaveProperty("id");
        expect(newJob.title).toEqual("New Job");
        expect(newJob.salary).toEqual(50000);
        expect(newJob.equity).toEqual("0");
        expect(newJob.companyHandle).toEqual("testCompany");
    });

    /** Test for finding all jobs */
    test("Can find all jobs", async () => {
        const jobs = await Job.findAll();
        expect(jobs).toEqual(expect.arrayContaining([
            expect.objectContaining({ title: expect.any(String) })
        ]));
    });

    /** Test for getting a job by ID */
    test("Can get a job by id", async () => {
        const job = await Job.get(testJobIds[0]); // assuming testJobIds holds IDs of created test jobs

        expect(job).toHaveProperty("id");
        expect(job.title).toBe("Test Job");
        expect(job.salary).toBe(100000);
        expect(job.equity).toBe("0.05");
        expect(job.companyHandle).toBe("testCompany");
    });

    /** Test for updating a job */
    test("Can update a job", async () => {
        const job = await Job.update(testJobIds[0], {
            title: "Updated Job"
        });

        expect(job).toHaveProperty("id");
        expect(job.title).toBe("Updated Job");
    });

    /** Test for deleting a job */
    test("Can delete a job", async () => {
        await Job.remove(testJobIds[0]);
        const job = await Job.get(testJobIds[0]).catch(e => e);
        expect(job instanceof Error).toBeTruthy();
    });
});
