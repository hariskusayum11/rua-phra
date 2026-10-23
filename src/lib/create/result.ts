export const CREATE_STORAGE_KEYS=["ruaphra-create-layout-v1","ruaphra-punch-v1","ruaphra-color-v1","ruaphra-result-v1"] as const;
export function clearCreateDraft(){for(const key of CREATE_STORAGE_KEYS){try{localStorage.removeItem(key);}catch{/* A kiosk can still reset its in-memory work. */}}}
export function creatorName(value:string){return value.normalize("NFC").replace(/[\u0000-\u001f\u007f<>]/g,"").replace(/(?:fuck|shit|เหี้ย|สัส|ควย|เย็ด)/gi,"***").trim().slice(0,40);}
export type MockupKind="art"|"boat"|"bag"|"mug";
export const mockupLabels:Record<MockupKind,string>={art:"แผ่นลาย",boat:"เรือพระ",bag:"ถุงผ้า",mug:"แก้ว"};
