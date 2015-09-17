/// <reference path="../typings/hover.d.ts" />

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


/*****************************************************************************/
/******** PRIVATE : Type definitions for identifier annotations **************/
/*****************************************************************************/

type smap<A> = { [x:string] : A }

interface AnnotInfo {
    file  : string
  , time  : Date
  , info  : imap<imap<Annot>>
}

/********************************************************************************/
/******** "Global" Annotation Table *********************************************/
/********************************************************************************/

export var infoProvider  : Hover.IProvider = (p) => {
  return undefined
}

export var errorProvider : Hover.IProvider = (f) => {
  return undefined
}

/********************************************************************************/
/******** "Global" Annotation Table *********************************************/
/********************************************************************************/

/*@ type Annot  = array [array [annotJ]] */

var curAnnot = "";

/*@ annotTable :: Annot */
var annotTable
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

/********************************************************************************/
/******** Function Returning Annot for A Row/Column *****************************/
/********************************************************************************/

var zooper     = "   Int\n-> Bool\n-> IO String";

function getAnnotText(row, col, annT) {
  var rowA = annT[row];

  if (!rowA){
    // No annotations defined for this row...
    return null;
  }

  for (var c in rowA){
    if (c == col) {
      // Found annotation beginning at exact row, col
      return rowA[c].ann;
    }
  }
  return null;
}


/******************************************************************/
/****** PUBLIC API ************************************************/
/******************************************************************/

/*@ annotFun :: (int, int) => string? */
function getAnnot(row, col){
  var r = getAnnotText(row + 1, col + 1, annotTable);
  if (r) { curAnnot = r;}
  return r;
}

/*@ setAnnots :: (Annot) => void */
function setAnnots(t) {
  annotTable = t;
}
