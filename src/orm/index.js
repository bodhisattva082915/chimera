import store from "./store";

store.defineMapper('initdb', {collection: 'initdb'});
store.findAll('initdb').then(console.log);

export default store;