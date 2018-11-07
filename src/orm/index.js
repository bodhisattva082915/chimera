import store from "./store";

store.defineMapper('_initdb', {collection: '_initdb'});
store.findAll('_initdb').then(console.log);

export default store;