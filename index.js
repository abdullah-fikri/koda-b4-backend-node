import express from "express";
import Routers from "./src/router/index.js";
import doc from "./src/lib/docs.js";

const app = express();
doc(app);
app.use(express.json());

app.use(Routers);

app.listen(8000, ()=>{
    console.log("Running on http://localhost:8000");
});
