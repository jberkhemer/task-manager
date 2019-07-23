//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneID, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create new user', async () => {
    const res = await request(app).post('/users').send({
        name: 'Jeremy',
        email: 'example@gmail.com',
        password: 'MyPass777'
    }).expect(201)

    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    expect(res.body).toMatchObject({
        user: {
            name: 'Jeremy'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass777')
})

test('Should login existing user', async () => {
    const res = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    expect(res.body).toMatchObject({
        token: user.tokens[1].token
    })
})

test('Bad credentials', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'deLicious!'
    }).expect(400)
})

test('Get profile', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('[UnAuth] Get profile', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Delete User', async () => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneID)
    expect(user).toBeNull
})

test('[UnAuth] Delete User', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    const user = await User.findById(userOneID)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jim-Bob'
        })
        .expect(200)

        const user = await User.findById(userOneID)
        expect(user.name).toEqual('Jim-Bob')
})

test('Update invalid data for user', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            phone: '727-656-5602'
        })
        .expect(400)
})