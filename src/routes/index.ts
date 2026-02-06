import { Router } from "express";


import authRoute from "../modules/auth/authRoute";







import form1Route from "../modules/form1/Routes/form1.Route";
import form2Route from "../modules/form2/Routes/form2.Routes";   
import form3Route from "../modules/form3/Routes/form3.Route";
import form4Route from "../modules/form4/Routes/form4.Routes";
import form5Route from "../modules/form5/Routes/form5.Routes";
// import form6Route from "../modules/form6/form6Routes";
// import form7Route from "../modules/form7/form7Route";
// import form8Route from "../modules/form8/form8Routes";
// import form9Route from "../modules/form9/form9Routes";
// import form10Route from "../modules/form10/form10Routes";


export const route = Router();





route.use("/api/auth", authRoute);




route.use("/api/form1", form1Route);
 route.use("/api/form2", form2Route);  
route.use("/api/form3", form3Route);  
 route.use("/api/form4", form4Route);
 route.use("/api/form5", form5Route);
//  route.use("/api/form6", form6Route);
//  route.use("/api/form7", form7Route);
//  route.use("/api/form8", form8Route);
// route.use("/api/form9", form9Route);
// route.use("/api/form10", form10Route);