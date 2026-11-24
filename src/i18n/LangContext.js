import { createContext, useContext } from 'react'
export const LC=createContext('en');
export const useL=()=>{const l=useContext(LC);return(a,b)=>l==='en'?a:b};
