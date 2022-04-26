import * as ajax from './ajax.js';

export function getState(){
    return new Promise((resolve, reject)=>{
        ajax.getJSONFromURL("/read", []).then(result=>{
            if(result.success){
                if(result.resp.success){
                    resolve(result.resp);
                }
                else{
                    reject(result.resp);
                }
            }
            else{
                reject(result);
            }
        })
    });
}

export function sendValues(vals){
    return new Promise((resolve, reject)=>{
        ajax.postURL("/command", [], JSON.stringify(vals)).then(result=>{
            if(result.success){
                if(result.resp.success){
                    resolve(result.resp);
                }
                else{
                    reject(result.resp);
                }
            }
            else{
                reject(result);
            }
        });
    })
}