const {success, error} = require('../functions')
const express = require('express')
const app = express()
const config = require('../config.json')


let members = [
    {id: 1, name: 'PHP'},
    {id: 2, name: 'JavaScript'},
    {id: 3, name: 'Python'},
    {id: 4, name: 'Java'},
    {id: 5, name: 'C#'}
]
let currentId = 6

let membersRouter = express.Router()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

membersRouter.route('/:id')
    .get((req,res) => {
        let id = parseInt(req.params.id)
        let member = members.find(m => m.id === id)
    
        if (!member) {
            return res.json(error("Member not found"))
        }
        res.json(success(member))
    })

    .post((req,res) => {
        let id = parseInt(req.params.id)
        let member = members.find(m => m.id === id)
    
        if (!member) {
            return res.json(error("Member not found"))
        }

        for (let i = 0; i < members.length; i++) {
            if (req.body.name === members[i].name && members[i].id !== id) {
                return res.json(error("Member name already exists"))
            }
        }

        member.name = req.body.name
        res.json(success(true))
    })
    .delete((req,res) => {
        let id = parseInt(req.params.id)
        let memberIndex = members.findIndex(m => m.id === id)
    
        if (memberIndex === -1) {
            return res.json(error("Member not found"))
        }

        members.splice(memberIndex, 1)
        res.json(success(true))
    })
    
membersRouter.route('/')
    .get((req, res) => {
        res.json(success(members))
    })
    .post((req, res) => {
        if (!req.body.name){
            return res.json(error("Missing required parameter: name"))
        }
        for (let i = 0; i < members.length; i++) {
            if (req.body.name === members[i].name) {
                return res.json(error("Member name already exists"))
            }
        }
        let newMember = {
            id: currentId++,
            name: req.body.name
        }
        members.push(newMember)
        res.json(success(newMember))
    })

app.use(config.rootAPI+'members', membersRouter)
//app.listen(config.port, () => console.log('Started on port '+config.port))

module.exports = app