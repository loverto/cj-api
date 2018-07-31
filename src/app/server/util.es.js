const elasticsearch = require('elasticsearch');

function getResult(body, callback) {
    var search =
        {
            index: 'zwytjsj-2018.07.18',
            //type: 'report',
            body: body
        };
    getES(search, function (data) {
        callback(data);
    });
}

function getES(searchInfo, callback) {
    const esClient = new elasticsearch.Client({
        host: 'http://elastic:CMBkC0JYyoMrLyYht1TU@103.83.44.129',
        log: 'error'
    });
    esClient.search(searchInfo).then(function (re) {
        callback(re);
    }, function (err) {
        console.trace(err.message);
    });
}

/**
 * 获取CPU数量
 */
function getCpus(){
    var cpu ={
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "sum": {
                    "field": "CPU分配量（核）"
                }
            },
            "3": {
                "sum": {
                    "field": "内存分配量（GB）"
                }
            },
            "4": {
                "sum": {
                    "field": "存储分配量（GB）"
                }
            }
        },
        "stored_fields": [
            "*"
        ],
        "script_fields": {},
        "docvalue_fields": [
            "@timestamp"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_all": {}
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1531584000000,
                                "lte": 1532188799999,
                                "format": "epoch_millis"
                            }
                        }
                    }
                ],
                "filter": [],
                "should": [],
                "must_not": []
            }
        }
    }
    getResult(cpu,function (data) {
        let cpuCores = data.aggregations[2].value;
        console.info(JSON.stringify(cpuCores))
        return cpuCores;
    })
}

/**
 * 获取内存数量
 */
function getMem(){

}

/**
 * 获取内存数量
 */
function getStorages(){

}

/**
 * 获取服务名和资源
 */
function getServiceNameAndResource(){
    var serviceNameAndResource = {
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "terms": {
                    "field": "业务系统名称.keyword",
                    "size": 500000000,
                    "order": {
                        "_count": "desc"
                    }
                },
                "aggs": {
                    "3": {
                        "sum": {
                            "field": "CPU分配量（核）"
                        }
                    }
                }
            }
        },
        "stored_fields": [
            "*"
        ],
        "script_fields": {},
        "docvalue_fields": [
            "@timestamp"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_all": {}
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1531584000000,
                                "lte": 1532188799999,
                                "format": "epoch_millis"
                            }
                        }
                    }
                ],
                "filter": [],
                "should": [],
                "must_not": []
            }
        }
    }
    getResult(serviceNameAndResource,function (data) {
        let value = data.aggregations[2].buckets;
        let json = [];
        value.forEach(function (item,value) {
            let cpu = item[3].value;
            let name = item.key;
            let j ={"cpu" : cpu,"name" : name};
            json.push(j);
        })

        console.debug(JSON.stringify(json))
    })
}


/**
 * 获取接入服务的数量
 */
function getAccessServices(){
    var accessService = {
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "1": {
                "cardinality": {
                    "field": "业务系统名称.keyword"
                }
            }
        },
        "stored_fields": [
            "*"
        ],
        "script_fields": {},
        "docvalue_fields": [
            "@timestamp"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_all": {}
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1531584000000,
                                "lte": 1532188799999,
                                "format": "epoch_millis"
                            }
                        }
                    }
                ],
                "filter": [],
                "should": [],
                "must_not": []
            }
        }
    }
    getResult(accessService,function (data) {
        console.log(JSON.stringify(data.aggregations[1].value))
    })
}

getAccessServices()
//getServiceNameAndResource()
//console.log(getCpus())


// getResult(body,function (data) {
//     console.info(JSON.stringify(data))
// })
