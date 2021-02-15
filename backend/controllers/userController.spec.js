const httpMocks = require("node-mocks-http")
const sinon = require("sinon")
const expect = require("chai").expect

const userController = require("./userController")
const userDAO = require("../models/user");

describe(".user_list()", function () {

  beforeEach(function () {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
  })

  afterEach(function () {
    userDAO.find.restore();
  })

  it("user_list success", async function () {
    sinon.stub(userDAO, 'find').returns([
      {email: "test@test.com", password: "test", name: "test"},
      {email: "test2@test.com", password: "test2", name: "test2"},
    ])

    req.user = {
      role: "admin"
    }

    // call target function
    await userController.user_list(req, res)

    // check
    expect(res.statusCode).equal(200)
  })

  it("user_list not admin", async function () {
    sinon.stub(userDAO, 'find').returns(null)

    req.user = {
      role: "user"
    }

    // call target function
    await userController.user_list(req, res)

    // check
    expect(res.statusCode).equal(403)
  })
})