import * as _ from 'lodash';
import { FnDBService, FnStorageService, ServerlessConfiguration, FnAuthService } from '../dist/index';
let db: FnDBService;
let storage: FnStorageService;
let auth: FnAuthService;

let solution: Array<Promise<object[] | object | string | string[] | number | never>> = [];
let tableName: string;

/*export default {
    config: function (configuration: ServerlessConfiguration) {},
    setDB: function (db_service: FnDBService, options?: object) {
        db = db_service;
        db.instance(options);
    },
    setStorage: function (storage_service: FnStorageService, options?: object) {
        storage = storage_service;
        storage.instance(options);
    },
    setAuth: function (auth_service: FnAuthService, options?: object) {
        auth = auth_service;
        auth.instance(options);
    },
    table: function (name: string, ids?: string | string[]) {
        switch (typeof ids) {
            case 'string':
                solution.push(db.getItem(name, <string>ids));
                break;
            case 'object':
                if (Array.isArray(ids)) {
                    solution.push(db.getItems(name, ids));
                    break;
                }
            default:
                solution.push(db.getItems(name));
        }
        
        tableName = name;

        return this;
    },
    where: function (attribute: string, value?: string | number | boolean, comparator?: string) {
        let _comparator = comparator || '=';

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res)) {
                    if (typeof value !== 'undefined') {
                        switch (_comparator) {
                            case '=':
                                return _.filter(res, [attribute, value]);
                            case '!=':
                                return _.filter(res, (o: any) => !_.isEqual(o[attribute], value));
                            case '<':
                                return _.filter(res, (o: any) => o[attribute] < value);
                            case '>':
                                return _.filter(res, (o: any) => o[attribute] > value);
                            case '<=':
                                return _.filter(res, (o: any) => o[attribute] <= value);
                            case '>=':
                                return _.filter(res, (o: any) => o[attribute] >= value);
                            case 'has':
                                return _.filter(res, (o: any) => _.indexOf(o[attribute], value) > -1);
                            default:
                                return Promise.reject('Invalid comparator in where operation');
                        }
                    }
                    else
                        return _.filter(res, (o) => _.has(o, attribute));
                }
                return Promise.reject('Invalid use of where operation');
            });

        return this;
    },
    orderBy: function (attribute: _.Many<string | _.ListIterator<object, any>>, order?: string | string[]) {
        let _order: string | string[];
        if (typeof attribute === 'string') {
            _order = (order === 'asc' || order === 'desc') ? order : 'asc';
        } else {
            _order = (order !== undefined && order.length === attribute.length) ? order : _.fill(Array(attribute.length), 'asc');
        }

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                   return _.orderBy(res, attribute, _order);
                return Promise.reject('Invalid use of orderBy operation');
            });

        return this;
    },
    first: function (quantity?: number) {
        let _quantity = (quantity && quantity > 1) ? quantity : 1;

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                   return _.slice(res, 0, _quantity);
                return Promise.reject('Invalid use of first operation');
            });

        return this;
    },
    count: function () {
        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                    return res.length;
                return Promise.reject('Invalid use of count operation');
            });
        return this;
    },
    project: function (...attributes: Array<string | string[]>) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res) && attributes.length > 0)
                    return _.reduceRight(res, (result: object[], o: object) => {
                        result.push(_.pick(o, attributes));
                        return result;
                    }, []);
                return Promise.reject('Invalid use of project operation');
            });
        return this;
    },
    map: function (iteratee: _.ObjectIterator<object, any>) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res))
                    return _.map(res, iteratee);
                return Promise.reject('Invalid use of map operation');
            });
        return this;
    },
    filter: function (iteratee: object) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res))
                    return _.filter(res, iteratee);
                return Promise.reject('Invalid use of filter operation');
            });
        return this;
    },
    reduce: function (iteratee: _.MemoIterator<object, object>, accumulator?: any[] | object | number) {
        let _accumulator = accumulator ? accumulator : [];
        if (solution[0])
            solution[0] = solution[0].then((res: _.Dictionary<string>) => {
                if (Array.isArray(res))
                    return _.reduceRight(res, iteratee, _accumulator);
                return Promise.reject('Invalid use of reduce operation');
            });
        return this;
    },
    insert: function (table_name?: string, items?: Object | object[]) {
        if (table_name) {
            if (items) {
                if (Array.isArray(items))
                    solution[0] = db.putItems(table_name, items);
                else
                    solution[0] = db.putItem(table_name, items);
            }
            else
                solution[0] = Promise.reject('Invalid use of insert operation');
        }
        else if (tableName) {
            solution[0] = solution[0].then((res) => {
                if(Array.isArray(res)) 
                    return <any>db.putItems(tableName, res);
                else
                    return db.putItem(tableName, res);
            })
        }
        else
            solution[0] = Promise.reject('Invalid use of insert operation');

        return this;
    },
    delete: function (table_name?: string, ids?: string | string[]) {
        if (table_name) {
            if(ids) {
                if (Array.isArray(ids))
                    solution[0] = db.deleteItems(table_name, ids);
                else
                    solution[0] = db.deleteItem(table_name, ids);
            }
            else 
                solution[0] = Promise.reject('Invalid use of delete operation');
        }
        else if (tableName) {
            solution[0] = solution[0].then((res: any) => {
                if(Array.isArray(res)) {
                     return <any>db.deleteItems(tableName, _.reduceRight(res, (accum: string[], item, key) => {
                        if(typeof item === 'string')
                            accum.push(item);
                        else if(_.size(item) === 1)
                            accum.push(<string>_.get(item, key));
                        return accum
                    }, []));
                }
                else
                    return db.deleteItem(tableName, res);
            })
        }
        else 
            solution[0] = Promise.reject('Invalid use of delete operation');

        return this;
    },
    join: function (accessor0: string, accessor1: string) {
        solution.unshift(Promise.all(_.pullAt(solution, [0, 1]))
                .then((res: any[]): any => {
                    if (Array.isArray(res[0]) && Array.isArray(res[1])) {
                        let length0 = res[0].length;
                        let length1 = res[1].length;
                        if (length0 < 1 || length1 < 1)
                            return [];
                        let index: any;
                        let aux;
                        if (length0 < length1) {
                            index = _.groupBy(res[0], accessor0);
                            return _.reduceRight(res[1], (result: Array<object>, o1: any) => {
                                aux = o1[accessor1];
                                if (_.has(index, aux))
                                    return _.map(index[aux], o0 => _.assign({}, _.omit(o0, accessor0), _.omit(o1, accessor1))).concat(result);
                                return result;
                            }, []);
                        }
                        index = _.groupBy(res[1], accessor1);
                        return _.reduceRight(res[0], (result: object[], o0: any) => {
                            aux = o0[accessor0];
                            if (_.has(index, aux))
                                return _.map(index[aux], o1 => _.assign({}, _.omit(o0, accessor0), _.omit(o1, accessor1))).concat(result);
                            return result;
                        }, []);
                    }
                    return Promise.reject('Invalid use of function join');
                }));
        return this;
    },
    bucket: function (bucket_name: string, id?: string) {
        if (id)
            solution[0] = storage.getObject(bucket_name, id);
        else
            solution[0] = storage.listObjects(bucket_name);

        return this;
    },
    upload: function (bucket_name: string, id: string, buffer: Buffer, mimetype?: string, access?: string) {
        solution[0] = storage.putObject(bucket_name, id, buffer, mimetype, access);

        return this;
    },
    deleteObject: function (bucket_name: string, ids: string | string[]){
        if (Array.isArray(ids))
            solution[0] = storage.deleteObjects(bucket_name, ids);
        else
            solution[0] = storage.deleteObject(bucket_name, ids);

        return this;
    },
    login: function (user: string, password: string, pool: string | object) {
        solution[0] = auth.authenticateUser(user, password, pool);

        return this;
    },
    refresh: function (refresh_token: string, pool: string | object) {
        solution[0] = auth.refreshToken(refresh_token, pool);

        return this;
    },
    then: function (result?: Function, reject?: Function) {
        let promise: Promise<object[] | object | string | number> = solution[0];
        if (result && reject) {
            promise = solution[0]
                .then((res: any) => {
                    return result(res);
                }, (err: Error) => {
                    return reject(err);
                });
        }
        else if (result) {
            promise = solution[0]
                .then((res: any) => {
                    return result(res);
                });
        }
        else if (reject) {
            promise = solution[0]
                .catch((err: Error) => {
                    return reject(err);
                });
        }
        tableName = '';
        solution = [];
        return promise;
    },
    promise: function () {
        tableName = '';
        return solution.shift();
    }
};*/

export default class Oasp4Fn {
    private db: FnDBService;
    private storage: FnStorageService;
    private auth: FnAuthService;

    private solution: Array<Promise<object[] | object | string | string[] | number | never>> = [];
    private tableName: string;

    constructor () {};
    config(configuration: ServerlessConfiguration) {}
    setDB(db_service: FnDBService, options?: object) {
        db = db_service;
        db.instance(options);
    }
    setStorage(storage_service: FnStorageService, options?: object) {
        storage = storage_service;
        storage.instance(options);
    }
    setAuth(auth_service: FnAuthService, options?: object) {
        auth = auth_service;
        auth.instance(options);
    }

    table(name: string, ids?: string | string[]) {
        switch (typeof ids) {
            case 'string':
                solution.push(db.getItem(name, <string>ids));
                break;
            case 'object':
                if (Array.isArray(ids)) {
                    solution.push(db.getItems(name, ids));
                    break;
                }
            default:
                solution.push(db.getItems(name));
        }
        
        tableName = name;
    
        return this;
    }
    where(attribute: string, value?: string | number | boolean, comparator?: string) {
        let _comparator = comparator || '=';

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res)) {
                    if (typeof value !== 'undefined') {
                        switch (_comparator) {
                            case '=':
                                return _.filter(res, [attribute, value]);
                            case '!=':
                                return _.filter(res, (o: any) => !_.isEqual(o[attribute], value));
                            case '<':
                                return _.filter(res, (o: any) => o[attribute] < value);
                            case '>':
                                return _.filter(res, (o: any) => o[attribute] > value);
                            case '<=':
                                return _.filter(res, (o: any) => o[attribute] <= value);
                            case '>=':
                                return _.filter(res, (o: any) => o[attribute] >= value);
                            case 'has':
                                return _.filter(res, (o: any) => _.indexOf(o[attribute], value) > -1);
                            default:
                                return Promise.reject('Invalid comparator in where operation');
                        }
                    }
                    else
                        return _.filter(res, (o) => _.has(o, attribute));
                }
                return Promise.reject('Invalid use of where operation');
            });

        return this;
    }
    orderBy(attribute: _.Many<string | _.ListIterator<object, any>>, order?: string | string[]) {
        let _order: string | string[];
        if (typeof attribute === 'string') {
            _order = (order === 'asc' || order === 'desc') ? order : 'asc';
        } else {
            _order = (order !== undefined && order.length === attribute.length) ? order : _.fill(Array(attribute.length), 'asc');
        }

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                   return _.orderBy(res, attribute, _order);
                return Promise.reject('Invalid use of orderBy operation');
            });

        return this;
    }
    first(quantity?: number) {
        let _quantity = (quantity && quantity > 1) ? quantity : 1;

        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                   return _.slice(res, 0, _quantity);
                return Promise.reject('Invalid use of first operation');
            });

        return this;
    }
    count() {
        if (solution[0])
            solution[0] = solution[0].then((res: Array<object>): any => {
                if (Array.isArray(res))
                    return res.length;
                return Promise.reject('Invalid use of count operation');
            });
        return this;
    }
    project(...attributes: Array<string | string[]>) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res) && attributes.length > 0)
                    return _.reduceRight(res, (result: object[], o: object) => {
                        result.push(_.pick(o, attributes));
                        return result;
                    }, []);
                return Promise.reject('Invalid use of project operation');
            });
        return this;
    }
    map(iteratee: _.ObjectIterator<object, any>) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res))
                    return _.map(res, iteratee);
                return Promise.reject('Invalid use of map operation');
            });
        return this;
    }
    filter(iteratee: object) {
        if (solution[0])
            solution[0] = solution[0].then((res: object[]): any => {
                if (Array.isArray(res))
                    return _.filter(res, iteratee);
                return Promise.reject('Invalid use of filter operation');
            });
        return this;
    }
    reduce(iteratee: _.MemoIterator<object, object>, accumulator?: any[] | object | number) {
        let _accumulator = accumulator ? accumulator : [];
        if (solution[0])
            solution[0] = solution[0].then((res: _.Dictionary<string>) => {
                if (Array.isArray(res))
                    return _.reduceRight(res, iteratee, _accumulator);
                return Promise.reject('Invalid use of reduce operation');
            });
        return this;
    }
    insert(table_name?: string, items?: Object | object[]) {
        if (table_name) {
            if (items) {
                if (Array.isArray(items))
                    solution[0] = db.putItems(table_name, items);
                else
                    solution[0] = db.putItem(table_name, items);
            }
            else
                solution[0] = Promise.reject('Invalid use of insert operation');
        }
        else if (tableName) {
            solution[0] = solution[0].then((res) => {
                if(Array.isArray(res)) 
                    return <any>db.putItems(tableName, res);
                else
                    return db.putItem(tableName, res);
            })
        }
        else
            solution[0] = Promise.reject('Invalid use of insert operation');

        return this;
    }
    delete(table_name?: string, ids?: string | string[]) {
        if (table_name) {
            if(ids) {
                if (Array.isArray(ids))
                    solution[0] = db.deleteItems(table_name, ids);
                else
                    solution[0] = db.deleteItem(table_name, ids);
            }
            else 
                solution[0] = Promise.reject('Invalid use of delete operation');
        }
        else if (tableName) {
            solution[0] = solution[0].then((res: any) => {
                if(Array.isArray(res)) {
                     return <any>db.deleteItems(tableName, _.reduceRight(res, (accum: string[], item, key) => {
                        if(typeof item === 'string')
                            accum.push(item);
                        else if(_.size(item) === 1)
                            accum.push(<string>_.get(item, key));
                        return accum
                    }, []));
                }
                else
                    return db.deleteItem(tableName, res);
            })
        }
        else 
            solution[0] = Promise.reject('Invalid use of delete operation');

        return this;
    }
    join(accessor0: string, accessor1: string) {
        solution.unshift(Promise.all(_.pullAt(solution, [0, 1]))
                .then((res: any[]): any => {
                    if (Array.isArray(res[0]) && Array.isArray(res[1])) {
                        let length0 = res[0].length;
                        let length1 = res[1].length;
                        if (length0 < 1 || length1 < 1)
                            return [];
                        let index: any;
                        let aux;
                        if (length0 < length1) {
                            index = _.groupBy(res[0], accessor0);
                            return _.reduceRight(res[1], (result: Array<object>, o1: any) => {
                                aux = o1[accessor1];
                                if (_.has(index, aux))
                                    return _.map(index[aux], o0 => _.assign({}, _.omit(o0, accessor0), _.omit(o1, accessor1))).concat(result);
                                return result;
                            }, []);
                        }
                        index = _.groupBy(res[1], accessor1);
                        return _.reduceRight(res[0], (result: object[], o0: any) => {
                            aux = o0[accessor0];
                            if (_.has(index, aux))
                                return _.map(index[aux], o1 => _.assign({}, _.omit(o0, accessor0), _.omit(o1, accessor1))).concat(result);
                            return result;
                        }, []);
                    }
                    return Promise.reject('Invalid use of function join');
                }));
        return this;
    }
    bucket(bucket_name: string, id?: string) {
        if (id)
            solution[0] = storage.getObject(bucket_name, id);
        else
            solution[0] = storage.listObjects(bucket_name);

        return this;
    }
    upload(bucket_name: string, id: string, buffer: Buffer, mimetype?: string, access?: string) {
        solution[0] = storage.putObject(bucket_name, id, buffer, mimetype, access);

        return this;
    }
    deleteObject(bucket_name: string, ids: string | string[]){
        if (Array.isArray(ids))
            solution[0] = storage.deleteObjects(bucket_name, ids);
        else
            solution[0] = storage.deleteObject(bucket_name, ids);

        return this;
    }
    login(user: string, password: string, pool: string | object) {
        solution[0] = auth.authenticateUser(user, password, pool);

        return this;
    }
    refresh(refresh_token: string, pool: string | object) {
        solution[0] = auth.refreshToken(refresh_token, pool);

        return this;
    }
    then(result?: Function, reject?: Function) {
        let promise: Promise<object[] | object | string | number> = solution[0];
        if (result && reject) {
            promise = solution[0]
                .then((res: any) => {
                    return result(res);
                }, (err: Error) => {
                    return reject(err);
                });
        }
        else if (result) {
            promise = solution[0]
                .then((res: any) => {
                    return result(res);
                });
        }
        else if (reject) {
            promise = solution[0]
                .catch((err: Error) => {
                    return reject(err);
                });
        }
        tableName = '';
        solution = [];
        return promise;
    }
    promise() {
        tableName = '';
        let res = solution.shift();
        solution = [];
        return res;
    }
}