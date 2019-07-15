const express = require('express')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const taskRouter = new express.Router()

taskRouter.post('/tasks', auth, async (req,res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send({ error: e })
    }
})
taskRouter.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit) || 10,
                skip: (parseInt(req.query.page)-1)*parseInt(req.query.limit) || (parseInt(req.query.page)-1)*10,
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
taskRouter.get('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if(!task){
            return res.status(404).send({ error: 'User not found' })
        }
        res.send(task)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
taskRouter.patch('/tasks/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates =['description', 'completed']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({ error: 'Invalid key provided'})
    }

    try{
        const task = await Task.find({ owner: req.user._id, _id: req.params.id})

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()
        if(!task){
            return res.status(404).send({ error: 'Task not found' })
        }
        res.send(task)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
taskRouter.delete('/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send({ error: 'Task not found' })
        }

        res.send(task)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})

module.exports = taskRouter