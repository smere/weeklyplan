const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

// mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");
 mongoose.connect("mongodb+srv://bire:bire123@cluster0.p3mlenj.mongodb.net/todoListDB");

const itemSchema = {
  name:String
};

const Item = mongoose.model("Item",itemSchema);

const Item1 = new Item({
  name:"This is item 1"
});

const Item2 = new Item({
  name:"This is Item 2"
});

const Item3 = new Item({
  name:"This is Item 3"
});

const itemArray = [Item1, Item2, Item3];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);




app.get("/", function(req, res){
  Item.find({})
  .then((foundItem)=>{
    if(foundItem.length===0){
      Item.insertMany(itemArray)
      .then(()=>{
        console.log("Successfully Inserted");
      })
      .catch((err)=>{
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle: "Today", newListItems:foundItem});
    }
    })
    .catch((err)=>{
      console.log(err);
    })
  });

// app.get("/work",function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems:workItems});
// })

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
})

app.post("/delete",function(req,res){
  const checkedName = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedName)
    .then(()=>{
      console.log("removed Successfully");
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedName}}})
    .then((foundList)=>{
      res.redirect("/"+listName)
    })
  }
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then((foundList)=>{
    if(!foundList){
      //console.log("Does't exist");
      const list = new List({
        name:customListName,
        items: itemArray
      });
      list.save();
      res.redirect("/"+ customListName);
    }else{
      //console.log("Exists");
      res.render("list",{listTitle: foundList.name, newListItems:foundList.items})
    }
  })
});

// app.get("/about",function(req,res){
//   res.render("about");
// })




app.listen(3000, function(){
  console.log("server started on port 3000")
});
