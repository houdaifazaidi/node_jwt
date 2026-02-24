const {success, error} = require('../functions')
const express = require('express')
const app = express()
const config = require('../config.json')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const db = mysql.createConnection({
    host: 'mysql-houdaifa.alwaysdata.net',
    user: 'houdaifa',
    password: 'hodofozodo',
    database: 'houdaifa_nodejs_rest',

})

let membersRouter = express.Router()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    next()
})

// JWT Secret Key
const JWT_SECRET = 'secret'

// Verify Token Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]
    
    if (!token) {
        return res.json(error("No token provided"))
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json(error("Invalid or expired token"))
        }
        req.user = decoded
        next()
    })
}

// Login Route
app.post(config.rootAPI + 'login', (req, res) => {
    const { id, username, password } = req.body
    
    // Hardcoded user verification
    if (id === 1 && username === 'fullstack' && password === '123456') {
        const token = jwt.sign(
            { id, username },
            JWT_SECRET,
            { expiresIn: '1h' }
        )
        return res.json(success({ token }))
    }
    
    res.json(error("Invalid credentials"))
})

membersRouter.route('/:id')
            .get((req,res) => {
                db.query('select * from members where id = ?', [req.params.id], (err, results) => {
                    if (err) return res.json(error(err.message))
                    if (results[0] === undefined) return res.json(error("member not found"))
                    res.json(success(results[0]))
                })
            })

            .put((req,res) => {
                if (!req.body.name) return res.json(error("Missing required parameter: name"))
                db.query('select * from members where id = ?', [req.params.id], (err, results) => {
                    if (err) return res.json(error(err.message))
                    if (results[0] === undefined) return res.json(error("member not found"))
                    
                    db.query('select * from members where name = ? and id != ?', [req.body.name, req.params.id], (err, results) => {
                        if (err) return res.json(error(err.message))
                        if (results[0] !== undefined) return res.json(error("Member name already exists"))

                        db.query('update members set name = ? where id = ?', [req.body.name, req.params.id], (err, results) => {
                            if (err) return res.json(error(err.message))
                            res.json(success(true))
                        })
                    })
                })
            })
            .delete((req,res) => {
                db.query('select * from members where id = ?', [req.params.id], (err, results) => {
                    if (err) return res.json(error(err.message))
                    if (results[0] === undefined) return res.json(error("member not found"))
                    
                    db.query('delete from members where id = ?', [req.params.id], (err, results) => {
                        if (err) return res.json(error(err.message))
                        res.json(success(true))
                    })
                })
            })
            
        membersRouter.route('/')
            .get((req, res) => {
                if (req.query.max === undefined){
                    db.query('select * from members', (err, results) => {
                        if (err) return res.json(error(err.message))
                        return res.json(success(results))
                    })
                    return
                }
                if (req.query.max <= 0) return res.json(error("Invalid value for parameter: max"))
                db.query('select * from members limit 0,'+req.query.max, (err, results) => {
                    if (err) return res.json(error(err.message))
                    res.json(success(results))
                })
            })
            .post((req, res) => {
                if (!req.body.name) return res.json(error("Missing required parameter: name"))
                db.query('select * from members where name = ?', [req.body.name], (err, results) => {
                    if (err) return res.json(error(err.message))
                    if (results[0] !== undefined) return res.json(error("Member name already exists"))

                    db.query('insert into members (name) values (?)', [req.body.name], (err, results) => {
                        if (err) return res.json(error(err.message))
                        res.json(success(true))
                    })
                })
            })

app.use(config.rootAPI+'members', verifyToken, membersRouter)
app.listen(config.port, () => console.log('Started on port '+config.port))

db.connect((err) => {
    if (err){
        console.log(err.message)
    }
    else {
        console.log('connected to database')
    }
})

module.exports = app
