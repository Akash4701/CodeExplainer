import express from 'express'
const app=express();



app.get('/',(req,res)=>{
    res.send("Your backend server has started")
})

const port=process.env.PORT|| 3000;
   app.listen(port,()=>{
    console.log(`Your server is listening on PORT ${port}`)

   })


