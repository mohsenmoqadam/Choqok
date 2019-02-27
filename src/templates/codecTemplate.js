/*---requires---*/

var codecDict = {
/*---dictItems---*/
}

class Obj{
    constructor(apiName, objName, objCode){
        this.api = apiName
        this.obj = objName
        this.code = objCode
    }

    setParams(objParams) {
        this.params = objParams
        return this
    }

    encode() {
        this.bin = codecDict[this.code].encoder(this.params)
        return this
    }

    encodeFrame(flag, trackId){
        let frameLenght = 10 + this.bin.length
        let frameCode = this.code 
        let frameFlag = flag
        let frameTrackId = trackId 

        this.frame = Buffer.alloc(frameLenght)
        this.frame.writeUInt32BE(frameLenght, 0)
        this.frame.writeUInt16BE(frameCode, 4)
        this.frame.writeUInt8(frameFlag, 6)
        this.frame.writeUInt8(0, 7)
        this.frame.writeUInt16BE(frameTrackId, 8)
        this.frame.fill(this.bin, 10)

        return this
    }

    decode(code, bin){
        let item = codecDict[code]
        this.api = item.api
        this.obj = item.obj
        this.code = code
        this.params = item.decoder(bin)
        this.bin = bin

        return this
    }

    decodeFrame(frame){
        this.frame.header.lenght = frame.readInt32BE(0, 4)
        this.frame.header.code = frame.readInt16BE(4, 2)
        this.frame.header.flag = frame.readInt8(6, 1)
        this.frame.header.reserved = frame.readInt8(7, 1)
        this.frame.header.trackId = frame.readInt16BE(8, 2)
        this.bin = frame.slice(10, frameLenght)
        
        let item = codecDict[this.code]
        this.api = item.api
        this.obj = item.obj
        this.params = item.decoder(this.bin)

        return this
    }
}
/*---apiClass---*/

module.exports = {Obj/*---classExported---*/};