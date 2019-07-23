//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks

const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/tasks')
const { userOne, userOneID, userTwo, setupDatabase, taskOne } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create task for user', async () => {
    const res = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)    
        .send({
            description: 'Test task!',
            owner: userOneID
        })
        .expect(201)

    const task = Task.findById(res.body._id)
    expect(task).not.toBeNull()
})

test('Get tasks for userOne', async () => {
    const res = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2)

})

test('Delete other user task', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull
})