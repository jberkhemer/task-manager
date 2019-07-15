const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const auth = require('../middleware/auth')
const User = require('../models/user')
const emailUser = require('../emails/accounts')

const userRoutes = new express.Router()

const avatar = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
            cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})

userRoutes.post('/users', async (req,res) => { //Create new user
    const user = new User(req.body)

    try{
        const token = await user.generateAuthToken()
        emailUser.sendWelcome(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send({ error: e })
    }
})
userRoutes.post('/users/login', async (req,res) => { //Login
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})
userRoutes.post('/users/logout', auth, async (req,res) => { //Logout of current session
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
userRoutes.post('/users/logoutAll', auth, async (req,res) => { //Clear all sessions
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})
userRoutes.get('/users/me', auth, async (req,res) => { //Get user profile
    res.send(req.user)
})
userRoutes.patch('/users/me', auth, async (req,res) => { //Update user profile
    const updates = Object.keys(req.body)
    const allowedUpdates =['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({ error: 'Invalid key provided'})
    }

    try{
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
userRoutes.delete('/users/me', auth, async (req,res) => { // Delete user profile and all associated tasks
    try{
        req.user.remove()
        emailUser.sendCancel(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
userRoutes.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => { // Upload user avatar
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
userRoutes.delete('/users/me/avatar', auth, async (req, res) => { //Delete user avatar
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
userRoutes.get('/users/:id/avatar', async (req, res) => { //Serve user avatar by _id
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = userRoutes