import { createContext, useContext, useReducer } from 'react';
import { createSkuList } from './views/CreateSKU';
import attrData from "./mock/attrList";

export const initialState = {
    skuList: createSkuList(attrData),
    attrList: attrData,
}
export const storeContext = createContext({
    state: initialState,
    dispatch: () => { },
});

export function storeReducer(state, action) {
    switch (action.type) {
        case 'setSkuList':
            return { ...state, skuList: action.payLoad };
        case 'setAttrList':
            return { ...state, attrList: action.payLoad };
        default:
            throw new Error();
    }
}

export function useStoreReducer() {
    return useReducer(storeReducer, initialState);
}

export function useStore() {
    return useContext(storeContext)
}
