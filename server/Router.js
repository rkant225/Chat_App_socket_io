const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
    res.send("Server is UP and RUNNING.")
})

module.exports = router;