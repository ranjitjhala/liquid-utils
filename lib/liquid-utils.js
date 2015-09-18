/// <reference path="../typings/hover.d.ts" />
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
function validInfo(s) {
    return { valid: true,
        info: s
    };
}
function invalidInfo(p) {
    return { valid: false,
        info: p
    };
}
function lookupInfo(p) {
    return function (i) {
        var info = i.info;
        if (p.line in info) {
            if (p.column in info[p.column]) {
                var a = info[p.line][p.column];
                return validInfo(a.ann);
            }
        }
        return invalidInfo(p.toString());
    };
}
function errInfo(text) {
    console.log("ERROR Info: " + text);
    return invalidInfo(text);
}
function lookupErrors(i) {
    return i.errs;
}
function modifiedAt(sFile) {
    return Q.nfcall(fs.stat, sFile)
        .then(function (stats) { return stats.mtime; });
}
var Annotations = (function () {
    function Annotations(cmd, args, subDir) {
        this.fileMap = {};
        this.cmd = cmd;
        this.args = args;
        this.subDir = subDir;
    }
    Annotations.prototype.command = function (sFile) {
        return this.cmd + ' ' + this.args.join(' ') + ' ' + sFile;
    };
    Annotations.prototype.jsonFile = function (srcFile) {
        var bDir = path.dirname(srcFile);
        var sFile = path.basename(srcFile);
        var jFile = sFile + ".json";
        return path.join(bDir, this.subDir, jFile);
    };
    Annotations.prototype.rebuild = function (sFile) {
        var cmd_ = this.command(sFile);
        var jFile = this.jsonFile(sFile);
        var run = Q.nfcall(child_process.exec, cmd_);
        return run.then(function (r) {
            var r = JSON.parse(fs.readFileSync(jFile, "utf8"));
            return r;
        });
    };
    Annotations.prototype.refresh = function (sFile) {
        var _this = this;
        var jFile = this.jsonFile(sFile);
        return modifiedAt(sFile)
            .then(function (sTime) {
            if (sFile in _this.fileMap) {
                var sInfo = _this.fileMap[sFile];
                var jTime = sInfo.time;
                if (sTime < jTime)
                    return sInfo;
            }
            return _this.rebuild(sFile);
        });
    };
    Annotations.prototype.getInfo = function (p) {
        return this.refresh(p.file)
            .then(lookupInfo(p))
            .catch(errInfo);
    };
    Annotations.prototype.getErrors = function (f) {
        return this.refresh(f)
            .then(lookupErrors)
            .catch(function (err) { return []; });
    };
    return Annotations;
})();
exports.Annotations = Annotations;
var annotTable = { 5: { 14: { ident: "foo",
            ann: "int -> int",
            row: 5,
            col: 14
        }
    },
    9: { 22: { ident: "map",
            ann: "(a -> b) -> [a] -> [b]",
            row: 9,
            col: 22
        },
        28: { ident: "xs",
            ann: "[b]",
            row: 9,
            col: 28
        }
    }
};
var ex = { "status": "error",
    "types": annotTable,
    "errors": [{ "start": { "file": "/Users/rjhala/tmp/foo.hs",
                "line": 6,
                "column": 14
            },
            "stop": { "file": "/Users/rjhala/tmp/foo.hs",
                "line": 6,
                "column": 17
            },
            "message": "/Users/rjhala/tmp/foo.hs:6:14-16: Error: GHC Error\n    Couldn't match expected type ‘Int’ with actual type ‘[Char]’"
        },
        { "start": { "file": "/Users/rjhala/tmp/foo.hs",
                "line": 9,
                "column": 16
            },
            "stop": { "file": "/Users/rjhala/tmp/foo.hs",
                "line": 10,
                "column": 21
            },
            "message": "/Users/rjhala/tmp/foo.hs:(9,16)-(10,20): Error: GHC Error\n    Couldn't match expected type ‘Int’ with actual type ‘[Char]’"
        }
    ]
};
