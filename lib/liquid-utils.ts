/// <reference path="../typings/hover.d.ts" />

import path          = require('path');
import fs            = require('fs');
import child_process = require('child_process');

/*****************************************************************************/
/******** PUBLIC : Type definitions for identifier annotations ***************/
/*****************************************************************************/

export type imap<A> = { [x:number] : A }

export interface Annot {
    ident : string
  , ann   : string
  , row   : number
  , col   : number
  }

export type TypeInfo = imap<imap<Annot>>

export interface LiquidInfo {
    status : string
  , types  : TypeInfo
  , errors : Hover.Error[]
}

/*****************************************************************************/
/******** PRIVATE : Type definitions for identifier annotations **************/
/*****************************************************************************/

type smap<A> = { [x:string] : A }

interface FileInfo {
    file : string        // completely expanded path to file
  , time : Date          // time at which current info is valid
  , info : TypeInfo      // type information
  , errs : Hover.Error[] // error information
}

/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/

function validInfo(s:string):Hover.Info {
  return { valid : true
         , info  : s
         }
}

function invalidInfo(p:string):Hover.Info {
  return { valid : false
         , info  : p
         }
}

function lookupInfo(p:Hover.Position) {
  return function(i:FileInfo): Hover.Info {
    var info = i.info;
    if (p.line in info){
      if (p.column in info[p.column]){
        var a = info[p.line][p.column];
        return validInfo(a.ann);
      }
    }
    return invalidInfo(p.toString());
  }
}

function errInfo(text:string):Hover.Info {
  console.log("ERROR Info: " + text);
  return invalidInfo(text);
  // atom.confirm({
    // message: "Hover Info Error" + text,
    // detailedMessage: text,
    // buttons: { Close: function (){ window.alert('ok'); } }
  // });
}


function lookupErrors(i:FileInfo): Hover.Error[] {
  return i.errs;
}

function modifiedAt(sFile:string):Q.Promise<Date> {
      return Q.nfcall(fs.stat, sFile)
              .then((stats:any) => stats.mtime)
}

/*****************************************************************************/
/******** Exported API *******************************************************/
/*****************************************************************************/

export class Annotations {

    private fileMap : smap<FileInfo>;
    private cmd     : string;   // "liquid" or "rsc"
    private args    : string[]; // "liquid" or "rsc"
    private subDir  : string;   // ".liquid"

    constructor(cmd:string, args:string[], subDir:string) {
        this.fileMap = {};
        this.cmd     = cmd;
        this.args    = args;
        this.subDir  = subDir;
    }

    private command(sFile:string):string{
      return this.cmd + ' ' + this.args.join(' ') + ' ' + sFile;
    }

    private jsonFile(srcFile:string):string{
      var bDir  = path.dirname(srcFile);
      var sFile = path.basename(srcFile);
      var jFile = sFile + ".json";
      return path.join(bDir, this.subDir, jFile);
    }

    private rebuild(sFile:string):Q.Promise<FileInfo> {
      var cmd_  = this.command(sFile);
      var jFile = this.jsonFile(sFile);
      var run:any = Q.nfcall(child_process.exec, cmd_);
      return run.then((r) => {
        var r:any = JSON.parse(fs.readFileSync(jFile, "utf8"));
        return r;
        })
    }

    // Reload .json file if it is stale, and return resulting FileInfo
    private refresh(sFile:string):Q.Promise<FileInfo> {
      var jFile = this.jsonFile(sFile);
      return modifiedAt(sFile)
               .then((sTime) => {
                  if (sFile in this.fileMap) {
                    var sInfo = this.fileMap[sFile]
                    var jTime = sInfo.time
                    // reuse fileInfo if not-stale
                    if (sTime < jTime)
                      return sInfo
                  }
                  // otherwise, rebuild fileInfo
                  return this.rebuild(sFile)
                });
    }

    getInfo(p:Hover.Position):Q.Promise<Hover.Info> {
      return this.refresh(p.file)
                 .then(lookupInfo(p))
                 .catch(errInfo);
    }

    getErrors(f:string):Q.Promise<Hover.Error[]>{
       return this.refresh(f)
                  .then(lookupErrors)
                  .catch((err) => {return []});

    }
}

/*****************************************************************************/
/******** Example: Annotation Table ******************************************/
/*****************************************************************************/

var annotTable : TypeInfo
   = { 5 : { 14 : { ident : "foo"
                  , ann   : "int -> int"
                  , row   : 5
                  , col   : 14
                  }
           }
     , 9 : { 22 : { ident : "map"
                  , ann   : "(a -> b) -> [a] -> [b]"
                  , row   : 9
                  , col   : 22
                  }
           , 28 : { ident : "xs"
                  , ann   : "[b]"
                  , row   : 9
                  , col   : 28
                  }
           }
     }

var ex:LiquidInfo
  = { "status": "error"
    , "types" : annotTable
    , "errors": [ {"start": { "file": "/Users/rjhala/tmp/foo.hs"
                            , "line":6
                            , "column":14
                            }
                  ,"stop":  { "file": "/Users/rjhala/tmp/foo.hs"
                            , "line":6
                            , "column":17
                            }
                  ,"message":"/Users/rjhala/tmp/foo.hs:6:14-16: Error: GHC Error\n    Couldn't match expected type ‘Int’ with actual type ‘[Char]’"
                  }

                , {"start": { "file"   : "/Users/rjhala/tmp/foo.hs"
                            , "line"   : 9
                            , "column" : 16
                            }
                  ,"stop" : { "file"   : "/Users/rjhala/tmp/foo.hs"
                            , "line"   : 10
                            , "column" : 21
                            }
                  ,"message":"/Users/rjhala/tmp/foo.hs:(9,16)-(10,20): Error: GHC Error\n    Couldn't match expected type ‘Int’ with actual type ‘[Char]’"
                  }
                ]
    }
