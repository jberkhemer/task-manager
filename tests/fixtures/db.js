const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/tasks')

const userOneID = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneID,
    name: 'Jerry',
    email: 'test@example.com',
    password: 'isAPass',
    tokens: [{
        token: jwt.sign({ _id: userOneID}, process.env.JWT_SECRET)
    }]
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoID,
    name: 'Jeremy',
    email: 'jeremy@example.com',
    password: 'isAPass',
    tokens: [{
        token: jwt.sign({ _id: userTwoID}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task one.',
    owner: userOneID
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task two',
    completed: true,
    owner: userOneID
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task two',
    owner: userTwoID
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne, userOneID,
    userTwo, userTwoID,
    taskOne, taskTwo, taskThree,
    setupDatabase
}