var express = require('express');
var app = express();
var fs = require("fs");



const elasticsearch = require('elasticsearch');

function getResult(body, callback,index) {
    if (index===undefined || index == null){
        index = 'zwytjsj-2018.07.18';
    }
    var search =
        {
            index: index,
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
        //host: 'http://elastic:CMBkC0JYyoMrLyYht1TU@localhost:9200',
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
function getCpus(cb){
    var resources ={
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
    getResult(resources,function (data) {
        let cpuCores = data.aggregations[2].value;
        let cc = JSON.stringify(cpuCores);
        console.debug(cc)
        cb(cc)
        //return cc;
    })
}

/**
 * 获取内存数量
 */
function getMem(cb){
    var resources ={
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
    getResult(resources,function (data) {
        let mem = data.aggregations[3].value;
        let mm = JSON.stringify(mem);
        console.info(mm)
        cb(mm)
        //return mm;
    })
}


/**
 * 获取内存数量
 */
function getStorages(cb){
    var resources ={
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
    getResult(resources,function (data) {
        let storage = data.aggregations[4].value;
        let ss = JSON.stringify(storage);
        console.info(ss)
        cb(ss)
        //return ss;
    })
}


/**
 * 获取服务名和CPU资源
 */
function getServiceNameAndResource(cb){
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
                        "3": "desc"
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

        console.log(JSON.stringify(data))

        let value = data.aggregations[2].buckets;
        let json = [];
        value.forEach(function (item,value) {
            let cpu = item[3].value;
            let name = item.key;
            let j ={"cpu" : cpu,"name" : name};
            json.push(j);
        })

        let message = JSON.stringify(json);
        console.debug(message)
        cb(message)
    })
}

/**
 * 获取云平台上部署的所有系统总数
 */
function getSystemsNumbers(cb) {
    var systemsNumbers = {
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
    getResult(systemsNumbers,function (data) {
        let message = JSON.stringify(data.aggregations[1].value);
        console.log(message)
        cb(message)
    })
}


/**
 * 获取接入服务的数量
 */
function getAccessServices(cb){
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
        let message = JSON.stringify(data.aggregations[1].value);
        console.log(message)
        cb(message)
    })
}

/**
 * 获取syslog中漏洞的数量
 */
function getLeaksNumbers(cb){
    var leaksNumber ={
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "terms": {
                    "field": "event_id.keyword",
                    "size": 1000,
                    "order": {
                        "_count": "desc"
                    }
                },
                "aggs": {
                    "3": {
                        "terms": {
                            "field": "event_msg.keyword",
                            "size": 1000,
                            "order": {
                                "_count": "desc"
                            }
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
            "@timestamp",
            "uploadclient"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "query_string": {
                            "query": "event_msg:漏洞",
                            "analyze_wildcard": true,
                            "default_field": "*"
                        }
                    },
                    {
                        "range": {
                            "uploadclient": {
                                "gte": 1526832000000,
                                "lte": 1527436800000,
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
    getResult(leaksNumber,function (data) {
        let values = data.aggregations[2].buckets;

        let json = [];
        let lnumber = 0
        values.forEach(function (item,value) {
            let leakName = item[3].key;
            let leakId = item.key;
            let leakCount = item.doc_count;
            lnumber +=leakCount;
            let j ={"leakId" : leakId,"leakName" : leakName,"count":leakCount};
            json.push(j);
        })

        //lnumber = json.length;
        // lnumber = json.length;

        let message = JSON.stringify(lnumber)
        cb(message)
    },'zwy-syslog-*')
}


function getLocalTime(nS) {
    let date = new Date(nS);
    return date.getFullYear() + '-' +(date.getMonth()+1) +'-'+date.getDate()+ ' ' +date.getHours() +':' + (date.getMinutes()==0?'00':date.getMinutes());
    //return date.toLocaleString().replace(/:\d{1,2}$/,' ');
}


/**
 * 获取系统的CPU资源利用率
 */
function getSystemCpuUtilizationRatio(cb){
    var cpuUtilizationRatio = {
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "date_histogram": {
                    "field": "@timestamp",
                    "interval": "10m",
                    "time_zone": "Asia/Shanghai",
                    "min_doc_count": 1
                },
                "aggs": {
                    "1": {
                        "max": {
                            "field": "zwy_ori_es_source.itemValue"
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
                        "match_phrase": {
                            "zwy_ori_es_source.itemType": {
                                "query": 3
                            }
                        }
                    },{
                        "match_phrase": {
                            "zwy_ori_es_source.serverId": {
                                "query": "7376c006-1ab3-4115-8f4b-eec1cde105b5"
                            }
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1532145600000,
                                "lte": 1532188800000,
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
    getResult(cpuUtilizationRatio,function (data) {
        let buckets = data.aggregations[2].buckets;
        let json = [];
        buckets.forEach(function (item,value) {
            let cpu = item[1].value;
            let dateTime = item.key;
            let localTime = getLocalTime(dateTime);
            //let leakCount = item.doc_count;
            //lnumber +=leakCount;
            let j ={"cpuUse" : cpu,"dateTime" : localTime};
            json.push(j);
        })
        let message = JSON.stringify(json);
        console.log(message)
        cb(message)
    },'zwy-eslog-*')
}


/**
 * 获取系统的内存资源利用率
 */
function getSystemctlMemtoryUtil(cb){
    var cpuUtilizationRatio = {
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "date_histogram": {
                    "field": "@timestamp",
                    "interval": "30m",
                    "time_zone": "Asia/Shanghai",
                    "min_doc_count": 1
                },
                "aggs": {
                    "1": {
                        "max": {
                            "field": "zwy_ori_es_source.itemValue"
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
                        "match_phrase": {
                            "zwy_ori_es_source.serverId": {
                                "query": "7376c006-1ab3-4115-8f4b-eec1cde105b5"
                            }
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1532102400000,
                                "lte": 1532188740000,
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
    getResult(cpuUtilizationRatio,function (data) {
        let buckets = data.aggregations[2].buckets;
        let json = [];
        buckets.forEach(function (item,value) {
            let mem = item[1].value;
            let dateTime = item.key;
            let localTime = getLocalTime(dateTime);
            //let leakCount = item.doc_count;
            //lnumber +=leakCount;
            let j ={"memUtilRatio" : mem,"dateTime" : localTime};
            json.push(j);
        })
        let message = JSON.stringify(json);
        console.log(message)
        cb(message)
    },'zwy-eslog-*')
}


/**
 * 系统的内存全部使用率
 * @param cb
 */
function getMemUtil(cb) {
    let m = {
        "size": 0,
        "_source": {
            "excludes": []
        },
        "aggs": {
            "1": {
                "sum": {
                    "field": "zwy_ori_es_source.itemValue"
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
                        "match_phrase": {
                            "zwy_ori_es_source.itemType": {
                                "query": 10
                            }
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": 1514736000000,
                                "lte": 1546271999999,
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
}

/**
 * 访问日志
 * @param cb
 */
function getSystemAccess(cb){
    var access = {
        "version": true,
        "size": 500,
        "sort": [
            {
                "12348法网": {
                    "order": "desc",
                    "unmapped_type": "boolean"
                }
            }
        ],
        "_source": {
            "excludes": []
        },
        "aggs": {
            "2": {
                "date_histogram": {
                    "field": "@timestamp",
                    "interval": "1d",
                    "time_zone": "Asia/Shanghai",
                    "min_doc_count": 1
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
                                "gte": 1532957520000,
                                "lte": 1546271999999,
                                "format": "epoch_millis"
                            }
                        }
                    }
                ],
                "filter": [],
                "should": [],
                "must_not": []
            }
        },
        "highlight": {
            "pre_tags": [
                "@kibana-highlighted-field@"
            ],
            "post_tags": [
                "@/kibana-highlighted-field@"
            ],
            "fields": {
                "*": {}
            },
            "fragment_size": 2147483647
        }
    };

    getResult(access,function (data) {
        let hits = data.hits.hits;

        let arr = [];
        for ( var i = 0 ;i <hits.length;i++){
            let source = hits[i]._source;

            let b = 0;
            //source.forEach((item,value)=>(value===number?b+=value:b+=0 ));



            let newVar = source["业务系统名称"];
            let j = {newVar:b};


            arr.push(j);
        }
        console.log(JSON.stringify(arr));
        let message = JSON.stringify(arr);
        cb(message);
    },'access-*')
}



/**
 * api 提供 CPU 总数 35730
 */
app.get('/api/cpus',function (req,res) {
    getCpus(function(data){
        res.end(data);
    })
})
/**
 *  提供内存总数 108979 单位GB
 */
app.get('/api/memorys',function (req,res) {
    getMem(function (data) {
        res.end(data)
    })
})
/**
 * 提供存储资源数量 3241423 单位GB
 */
app.get('/api/storages',function (req,res) {
    getStorages(function (data){
        res.end(data)
    })
})
/**
 * 获取系统总数
 */
app.get('/api/systems',function (req,res) {
    getSystemsNumbers(function (data) {
        res.end(data)
    })
})
/**
 * 获取漏洞总数
 */
app.get('/api/leaks',function (req,res) {
    getLeaksNumbers(function (data) {
        res.end(data);
    })
})

/**
 * 云平台上所有的系统和CPU资源占用排名
 */
app.get('/api/services-cpu',function (req,res) {
    getServiceNameAndResource(function (data) {
        res.end(data)
    })
})


/**
 * 获取单个系统的CPU资源排名，折线图数据
 */
app.get('/api/system-cpu-utilization-ratio',function (req,res) {
    getSystemCpuUtilizationRatio(function (data) {
        res.end(data);
    })
})

app.get('/api/system-mem-utilization-ratio',function (req, res) {
    getSystemctlMemtoryUtil(function (data) {
        res.end(data)
    })
})

/**
 * 一个月之内的所有系统的访问日志
 */
app.get('/api/system-access',function (req,res) {
    getSystemAccess(function (data) {
        res.end(data);
    })
})









/**
 * 接入服务Cpu 使用情况
 */
app.get('/api/access-service-cpu',function (req,res) {
    getServiceNameAndResource(function (data) {
        res.end(data)
    })
})
/**
 * 接入服务数量
 */
app.get('/api/access-services-number',function (req,res) {
    getAccessServices(function (data) {
        res.end(data)
    })
})
/**
 *  接入委办局数量
 */
app.get('/api/access-board-bureau',function (req,res) {
    getAccessBoardBureau(function (data) {
        res.end(data)
    })
})





app.get('/listUsers', function (req, res) {
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log( data );
        res.end( data );
    });
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})

