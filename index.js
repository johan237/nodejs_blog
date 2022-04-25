const  ejs = require("ejs");
const express = require("express");
const app = express();
const multer = require('multer');
const path = require('path')
const methodOverride = require('method-override');
const axios = require('axios')
app.use(express.static(path.join(__dirname, 'public')))
var mysql = require('mysql');
let name="johan"
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:'blogdb'
});
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload = multer({
    storage: storage
});

con.connect(function(err) {
  if (err) throw err;
    console.log("Connected!");
});

app.listen('3000')
app.set('view engine','ejs')
// npm install -g nodemonzzwsx


 function getNews(){
   return axios({
    method: 'get',
    url: 'https://newsapi.org/v2/everything?q=bitcoin&apiKey=fdfe965c1ebf43018b35af702f393177',
    params: {
      _limit: 5
    }
  })
    
 }

app.get('/', async  (req,res)=>{

    let sql = `SELECT * FROM blog`;
    con.query(sql, async function (err, result) {
      if (err) throw err;
    // res.send(JSON.stringify(result))
    const rows= []
    Object.keys(result).forEach(function(key) {
        rows.push(result[key])
      });
     

      axios({
        method: 'get',
        url: 'https://newsapi.org/v2/everything?q=bitcoin&apiKey=fdfe965c1ebf43018b35af702f393177',
        params: {
          _limit: 5
        }
      })
      .then((apiRes)=>{
        let data = apiRes
        console.log(data.data.articles)
        let news = data.data.articles
        res.render("index", {name,rows,news })

    } )
      
    // con.end()
    });
})

app.get('/new',(req,res)=>{
    
    res.render("new",{name})
})

app.get('/post/:id',(req,res)=>{
  let begin = req.params.id
    if(begin.charAt(0) != 'a'){
    let sql = `SELECT * FROM blog WHERE id = ${req.params.id} LIMIT 1`;
    con.query(sql, function (err,result ) {
        if (err) throw err;
      // res.send(JSON.stringify(result))
      console.log(result[0].title)
      val = result[0]
    //   con.end()
    // res.send("hello") 
    res.render('post',{val,api:false})
})
    }else{
     end  = begin.substring(1,begin.length-1)
      axios({
        method: 'get',
        url: 'https://newsapi.org/v2/everything?q=bitcoin&apiKey=fdfe965c1ebf43018b35af702f393177',
        params: {
          _limit: 5
        }
      })
      .then((apiRes)=>{
        let data = apiRes
        console.log( end)
        console.log( "he;;p")
        let val = data.data.articles[end]
        res.render("post", {val,api:true})

    } )
    }
})

app.get('/login',(req,res)=>{
    res.render('login.ejs')
})

app.get('/manage',(req,res)=>{
    let sql = `SELECT * FROM blog`;
    con.query(sql, function (err, result) {
      if (err) throw err;
        const rows= []
    Object.keys(result).forEach(function(key) {
        rows.push(result[key])
      });
    res.render("managepost",{rows})
      
    });
})

app.post('/auth',(req,res)=>{
   const  {name,password} = req.body

    if(name=='root' & password=='root'){
        res.render('admin')
    }else{
        res.send('Invalid Credentials')
    }
})

app.get('/admin',(req,res)=>{
  res.redirect('/manage')
})



app.post('/', upload.single('image'),(req,res)=>{
    let {title,content,isBreaking,category} = req.body
    let newCategory = category.toString()
    let filename = req.file['filename']
    let sql = `INSERT INTO blog (title, content, isBreaking, imageUrl, category) VALUES ('${title}','${content}','${isBreaking}','${filename}','${newCategory}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Row inserted with id = "+ result.insertId);
      res.redirect('/')
    //   con.end()
    });
    
  });


  app.post('/:id', upload.single('image'),(req,res)=>{
    // console.log(req.body)
    // res.send(req.body)
    let {title,content,isBreaking,category} = req.body
    let newCategory = category.toString()
    let filename = req.file['filename']
    let sql = `UPDATE blog  SET title = '${title}', content = '${content}',isBreaking = '${isBreaking}',category = '${category}',imageUrl = '${filename}'
    WHERE id = ${req.params.id};`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Row update with id = ");
      res.redirect('/manage')
    //   con.end()
    });
})

app.get('/delete/:id',(req,res)=>{
  let sql = `DELETE FROM blog  
  WHERE id = ${req.params.id};`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Row DELETE SUCESSFULLY with id = ");
    res.redirect('/manage')
  //   con.end()
  });
})

app.get('/update/:id',(req,res)=>{

  let sql = `SELECT * FROM blog WHERE id = ${req.params.id} LIMIT 1`;
  con.query(sql,function (err, result) {
      if (err)
        console.log('Error is: ', err);
      let val = result[0]
      res.render('update', {val});
    })
})
    // res.send(req.file)
