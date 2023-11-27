const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    const result = sqlForPartialUpdate(
      { firstName: "Aliya" },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ["Aliya"],
    });
  });

  test("works: 2 items", function () {
    const result = sqlForPartialUpdate(
      { firstName: "Test", lastName: "Tester" },
      { firstName: "first_name", lastName: "last_name" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"last_name\"=$2",
      values: ["Test", "Tester"],
    });
  });

  test("throws BadRequestError with no data", function () {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });
});
