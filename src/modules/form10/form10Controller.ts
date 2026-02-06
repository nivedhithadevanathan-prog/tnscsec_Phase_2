// import { Request, Response } from "express";
// import { Form10Usecase } from "./form10Usecase";
// import { sendResponse, sendError } from "../../utils/response";
// import {
//   rejectSchema,
//   withdrawSchema,
//   finalizeSchema,
//   submitSchema,
//   initForm10Schema
// } from "./form10Schema";

// export const Form10Controller = {

//   async getPreview(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const data = await Form10Usecase.getPreview(uid);
//       return sendResponse(res, 200, "Form10 preview fetched", data);

//     } catch (err: any) {
//       return sendError(res, 500, err.message);
//     }
//   },

//   async init(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const { error } = initForm10Schema.validate(req.body);
//       if (error) return sendError(res, 400, error.message);

//       const data = await Form10Usecase.init(uid);
//       return sendResponse(res, 200, "Form10 initialized successfully", data);

//     } catch (err: any) {
//       return sendError(res, 400, err.message);
//     }
//   },

//   async reject(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       const { error } = rejectSchema.validate(req.body);
//       if (error) return sendError(res, 400, error.message);

//       await Form10Usecase.reject(req.body, uid);
//       return sendResponse(res, 200, "Candidates rejected");

//     } catch (e: any) {
//       return sendError(res, 400, e.message);
//     }
//   },

//   async withdraw(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       const { error } = withdrawSchema.validate(req.body);
//       if (error) return sendError(res, 400, error.message);

//       await Form10Usecase.withdraw(req.body, uid);
//       return sendResponse(res, 200, "Candidates withdrawn");

//     } catch (e: any) {
//       return sendError(res, 400, e.message);
//     }
//   },

//   async finalize(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       const { error } = finalizeSchema.validate(req.body);
//       if (error) return sendError(res, 400, error.message);

//       await Form10Usecase.finalize(req.body, uid);
//       return sendResponse(res, 200, "Society finalized");

//     } catch (e: any) {
//       return sendError(res, 400, e.message);
//     }
//   },

//   async submit(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       const { error } = submitSchema.validate(req.body);
//       if (error) return sendError(res, 400, error.message);

//       await Form10Usecase.submit(req.body.form10_id, uid);
//       return sendResponse(res, 200, "Form10 submitted");

//     } catch (e: any) {
//       return sendError(res, 400, e.message);
//     }
//   },

//   async list(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const data = await Form10Usecase.list(uid);
//       return sendResponse(res, 200, "Form10 winners list fetched", data);

//     } catch (e: any) {
//       return sendError(res, 400, e.message);
//     }
//   }
// };
