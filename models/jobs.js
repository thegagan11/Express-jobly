"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */
class Job {
    /**
     * Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws BadRequestError if job already in database.
     */
    static async create({ title, salary, equity, companyHandle }) {
        const result = await db.query(
            `INSERT INTO jobs
                (title, salary, equity, company_handle)
             VALUES
                ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [title, salary, equity, companyHandle]
        );

        const job = result.rows[0];
        return job;
    }

    /**
     * Find all jobs, with optional filtering criteria.
     */
    static async findAll({ title, minSalary, hasEquity } = {}) {
        let query = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle AS "companyHandle"
                     FROM jobs`;
        let whereExpressions = [];
        let queryValues = [];

        // Add WHERE clauses for each filter
        if (title) {
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (minSalary) {
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`);
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    /**
     * Given a job id, return data about the job.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
            [id]
        );

        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    /**
     * Update job data with `data`.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, 
                                    title, 
                                    salary, 
                                    equity, 
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    /**
     * Delete given job from database; returns undefined.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
