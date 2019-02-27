var codec = require('./codec')

var replyApi = new codec.SampleRep
var myObj1 = replyApi.Obj1().setParams({a:"a",b:"b"}).encode()
console.log("One encoded object from reply API: ", myObj1)

var myObj2 = new codec.Obj
console.log("One decodec object from reply API:", myObj2.decode(10021, myObj1.bin))
