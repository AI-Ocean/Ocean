const httpMocks = require("node-mocks-http")
const sinon = require("sinon")
const expect = require("chai").expect

const authController = require("./authController")
const userDAO = require("../models/user");


describe(".siginup()", function () {

  beforeEach(function() {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
  })

  afterEach(function() {
    userDAO.findOne.restore();
  })

  it("user create success", async function () {
    sinon.stub(userDAO, 'findOne').returns(null)
    sinon.stub(userDAO.prototype, 'save').returns()

    // request body
    req.body = {
      email: "test@test.com",
      password: "testtest",
      name: "test"
    }

    // call target function
    await authController.signup(req, res)

    // check
    sinon.assert.calledWith(userDAO.findOne, {
      email: req.body.email,
    });
    expect(res.statusCode).equal(201)
  })

  it("user info not exist", async function () {
    sinon.stub(userDAO, 'findOne')

    // request body
    req.body = {}

    // call target function
    await authController.signup(req, res)

    expect(res.statusCode).equal(400)
  })

  it("user already exist", async function () {
    sinon.stub(userDAO, 'findOne').returns(
      {
        email: "test@test.com",
        name: "test",
        password: "testtest"
      }
    )

    // request body
    req.body = {
      email: "test@test.com",
      password: "testtest",
      name: "test"
    }

    // call target function
    await authController.signup(req, res)

    expect(res.statusCode).equal(400)
  })
})

describe(".siginin()", function () {

  beforeEach(function() {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
  })

  afterEach(function() {
  })

  it("signin success", async function () {})
})