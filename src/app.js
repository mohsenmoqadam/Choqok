const execSync = require('child_process').execSync;
const commandExistsSync = require('command-exists').sync;
const fs = require('fs');

// cmd: linux cmd
// return: void
function runOsCommand(cmd) {
    execSync(cmd)
}
// example:
// runOsCommand('ls -lha')

// install protocol-buffers globally
function installProtoCompiler() {
    if (commandExistsSync('protocol-buffers')) {
        return
    } else {
        runOsCommand('npm install -g protocol-buffers')
    }
}

// protoFile: one proto file
// jsFile: target js file
// return: void
function compileProto(protoFile, jsFile) {
    runOsCommand('protocol-buffers '.concat(protoFile, " -o ", jsFile))
}
// exmple.

// protoPath: where is proto files
// return: {req:[fileName], rep:[fileName]}
function getProtofiles(protoPath){
    let protoFiles = []
    fs.readdirSync(protoPath).forEach(file => {
        if (file.endsWith('.req.proto')) protoFiles.push(file)
        if (file.endsWith('.rep.proto')) protoFiles.push(file)
        if (file.endsWith('.sig.proto')) protoFiles.push(file)
      });
    return protoFiles
}
// example.

// protoPath: where proto files exist
// jsPath: where save js files
// return: void
function convertProtoToJs(protoPath, jsPath){
    let protoFiles = getProtofiles(protoPath)
    let jsFiles = []
    protoFiles.forEach(file => {
        let protoFile = protoPath.concat('/', file)
        let jsFileName = file.substring(0, file.indexOf(".proto")).concat('.js')
        jsFiles.push(jsFileName)
        let jsFile = jsPath.concat('/', jsFileName)
        compileProto(protoFile, jsFile)
    })
    return jsFiles
}

// install protobuff compiler
installProtoCompiler()

// read configurations
let config = JSON.parse(fs.readFileSync('./etc/config.json', 'utf8'));
let protoCodes = JSON.parse(fs.readFileSync('./proto/code.json', 'utf8'));
let packagedotjson = JSON.parse(fs.readFileSync('./src/templates/package.json', 'utf8'));

// prepare variables
let protoPath = config["getProtoFrom"]
let projectName = config["name"]
let projectVersion = config["version"]
let projectDescription = config["description"]
let projectAuthor = config["author"]
let projectPath = `${config["saveProjectIn"]}/${projectName}`
let requires = ""
let dictItems = ""
let tmpApiClasses = {}
let apiClasses = ""
let classExported = ""

// create directories
runOsCommand(`mkdir ${projectPath}`)
runOsCommand(`mkdir ${projectPath}/src`)

// create package.json
packagedotjson["name"] = projectName
packagedotjson["version"] = projectVersion
packagedotjson["description"] = projectDescription
packagedotjson["author"] = projectAuthor
fs.writeFile(`${projectPath}/package.json`, JSON.stringify(packagedotjson), function(error) {return 0})

// convert proto
let protoFiles = convertProtoToJs(protoPath, `${projectPath}/src`)

// create codec.js
var codecTemplate = "./src/templates/codecTemplate.js";
var codecBuff = fs.readFileSync(codecTemplate, "utf8");
protoFiles.forEach(jsName => {
    // create apiName
    let apiName = ''
    jsName.substring(0, jsName.indexOf(".js")).split('.').forEach(chunk => {
        if (apiName === '')
            apiName = apiName.concat(chunk)
        else
            apiName = apiName.concat(chunk.charAt(0).toUpperCase(), chunk.slice(1))
    })
    // create requires
    if (requires === "") requires = `var ${apiName} = require('./${jsName}')`
    else requires = `${requires}\nvar ${apiName} = require('./${jsName}')`
    // get js module
    let jsFile = require(`../${projectPath}/src/${jsName}`)
    // create classExported
    let className = `${apiName.charAt(0).toUpperCase()}${apiName.slice(1)}`
    classExported = `${classExported}, ${className}`
    // create dictItems and apiClass
    if (!tmpApiClasses[apiName]) tmpApiClasses[apiName] = `\nclass ${className} {`
    Object.keys(jsFile).forEach(func => {
        let objCode = protoCodes[jsName.substring(0, jsName.indexOf(".js")).concat('.proto')][func]
        // update dictItems
        if (dictItems === "") dictItems = `\t${objCode}: { api: '${apiName}', obj:'${func}', decoder: (params) => {return ${apiName}.${func}.decode(params)}, encoder: (params) => {return ${apiName}.${func}.encode(params)} },`
        else dictItems = `${dictItems}\n\t${objCode}: { api: '${apiName}', obj:'${func}', decoder: (params) => {return ${apiName}.${func}.decode(params)}, encoder: (params) => {return ${apiName}.${func}.encode(params)} },`
        // update apiClass
        tmpApiClasses[apiName] = `${tmpApiClasses[apiName]}\n\t${func}(){ return new Obj('${apiName}', '${func}', ${objCode})}`
    })
    tmpApiClasses[apiName] = `${tmpApiClasses[apiName]}\n}`
})
// concat all classes
Object.keys(tmpApiClasses).forEach(item => {apiClasses = `${apiClasses}${tmpApiClasses[item]}`})
codecBuff = codecBuff.replace("/*---requires---*/", requires)
codecBuff = codecBuff.replace("/*---dictItems---*/", dictItems)
codecBuff = codecBuff.replace("/*---apiClass---*/", apiClasses)
codecBuff = codecBuff.replace("/*---classExported---*/", classExported)
fs.writeFileSync(`${projectPath}/src/codec.js`, codecBuff)
runOsCommand(`cp ./src/templates/app.js ${projectPath}/src/app.js`)
