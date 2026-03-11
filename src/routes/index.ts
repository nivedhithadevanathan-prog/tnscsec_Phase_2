import { Router } from "express";


import authRoute from "../modules/auth/authRoute";

import form1Route from "../modules/form1/Routes/form1.Route";
import form2Route from "../modules/form2/Routes/form2.Routes";   
import form3Route from "../modules/form3/Routes/form3.Route";
import form4Route from "../modules/form4/Routes/form4.Routes";
import form5Route from "../modules/form5/Routes/form5.Routes";
import form5bRoute from "../modules/form5b/Routes/form5b.Routes";
import form6Route from "../modules/form6/Routes/form6.Routes";
import form7Route from "../modules/form7/Routes/form7.Route";
import form8Route from "../modules/form8/Routes/form8.Routes";
import form9Route from "../modules/form9/Routes/form9.Routes";
import { verifyToken } from "../middleware/auth.middleware";
import form10Route from "../modules/form10/Routes/form10.Routes";

export const route = Router();

route.use("/api/auth", authRoute);

route.use("/api/form1", form1Route);
route.use("/api/form2", form2Route);  
route.use("/api/form3", form3Route);  
route.use("/api/form4", form4Route);
route.use("/api/form5", form5Route);
route.use("/api/form5b", form5bRoute);
route.use("/api/form6", form6Route);
route.use("/api/form7", form7Route);
route.use("/api/form8", form8Route);
route.use("/api/form9", verifyToken, form9Route);
route.use("/api/form10", form10Route);