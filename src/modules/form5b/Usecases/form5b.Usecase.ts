import { Form5BService } from "../../form5b/Services/form5b.Service";

export const Form5BUsecase = {

  /*GET Form5B Preview*/
  getPreview(uid: number) {
    return Form5BService.getPreview(uid);
  },

  /*POST Stop Societies*/
  stopSocieties(payload: {
    uid: number;
    societies: any[];
  }) {
    return Form5BService.stopSocieties(payload);
  },

stopCandidates(payload: {
  uid: number;
  candidates: any[];
}) {
  return Form5BService.stopCandidates(payload);
},

submitForm5B(uid: number) {
  return Form5BService.submitForm5B(uid);
},

/*GET Form5B list*/
getForm5BListByUser(params: { uid: number; role: number; zone_id?: string; }) {

  const { uid, role, zone_id } = params;

  return Form5BService.getForm5BListByUser({
    uid,
    role,
    zone_id,  
  });

},

/*GET Editable Form5B*/
getEditableForm5BByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form5BService.getEditableForm5BByUser({
    uid,
    role,
  });

},

/*PUT Edit Form5B*/
editForm5B(payload: {
  uid: number;
  role: number;
  societies: any[];
  candidates: any[];
}) {
  return Form5BService.editForm5B(payload);
},

};