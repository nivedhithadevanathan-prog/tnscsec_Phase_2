// import { Request, Response } from "express";
// import { sendResponse, sendError } from "../../utils/response";
// import { Form6Usecase } from "./form6Usecase";
// import { simulateForm6Schema, stopElectionSchema,submitForm6Schema,withdrawCandidateSchema } from "./form6Schema";

// export const Form6Controller = {

// async getBasePreview(req: Request, res: Response) {
//   try {
//     const uid = Number((req as any).user?.uid);
//     if (!uid) return sendError(res, 401, "Unauthorized");

//     const data = await Form6Usecase.getBasePreview(uid);
//     return sendResponse(
//       res,
//       200,
//       "Form4 & Form5 society-member preview fetched",
//       data
//     );
//   } catch (err: any) {
//     return sendError(res, 500, err.message);
//   }
// },

// async simulatePreview(req: Request, res: Response) {
//   try {
//     const uid = Number((req as any).user?.uid);
//     if (!uid) return sendError(res, 401, "Unauthorized");

//     const { error } = simulateForm6Schema.validate(req.body);
//     if (error) {
//       return sendError(res, 400, error.details[0].message);
//     }

//     const data = await Form6Usecase.simulatePreview(req.body, uid);

//     return sendResponse(
//       res,
//       200,
//       "Form6 preview simulation calculated",
//       data
//     );
//   } catch (err: any) {
//     return sendError(res, 500, err.message);
//   }
// },

// async stopElection(req: Request, res: Response) {
//   try {
//     const uid = Number((req as any).user?.uid);
//     if (!uid) return sendError(res, 401, "Unauthorized");

//     const { error } = stopElectionSchema.validate(req.body);
//     if (error) return sendError(res, 400, error.details[0].message);

//     const result = await Form6Usecase.stopElection(req.body, uid);
//     return sendResponse(res, 200, "Election action updated", result);

//   } catch (err: any) {
//     return sendError(res, 400, err.message);
//   }
// },


// async submitForm6(req: Request, res: Response) {
//   try {
//     const uid = Number((req as any).user?.uid);
//     if (!uid) return sendError(res, 401, "Unauthorized");

//     const { error } = submitForm6Schema.validate(req.body);
//     if (error) return sendError(res, 400, error.details[0].message);

//     const result = await Form6Usecase.submitForm6(
//       req.body.form6_id,
//       uid
//     );

//     return sendResponse(res, 200, "Form6 submitted successfully", result);

//   } catch (err: any) {
//     return sendError(res, 400, err.message);
//   }
// },

// async initForm6(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const data = await Form6Usecase.initForm6(uid);

//       return sendResponse(
//         res,
//         200,
//         "Form6 initialized",
//         data
//       );

//     } catch (err: any) {
//       return sendError(res, 500, err.message);
//     }
//   },

//   async withdrawCandidate(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const { error } = withdrawCandidateSchema.validate(req.body);
//       if (error) return sendError(res, 400, error.details[0].message);

//       const result = await Form6Usecase.withdrawCandidate(
//         req.body,
//         uid
//       );

//       return sendResponse(
//         res,
//         200,
//         "Candidate action recorded",
//         result
//       );

//     } catch (err: any) {
//       return sendError(res, 400, err.message);
//     }
//   },
  

//   async listForm6(req: Request, res: Response) {
//     try {
//       const uid = Number((req as any).user?.uid);
//       if (!uid) return sendError(res, 401, "Unauthorized");

//       const data = await Form6Usecase.listForm6(uid);

//       return sendResponse(
//         res,
//         200,
//         "Form6 final list fetched",
//         data
//       );

//     } catch (err: any) {
//       return sendError(res, 404, err.message);
//     }
//   },

// };
