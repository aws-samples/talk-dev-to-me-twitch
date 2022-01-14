import { JSONObject, required } from "ts-json-object"

export class Product extends JSONObject {
    
    @required
    // @ts-ignore
    id:string
    @required
    // @ts-ignore
    name:string
    @required
    // @ts-ignore
    price:number
}