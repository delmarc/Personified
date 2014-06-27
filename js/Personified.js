/**
* This is an attempt at making an MVC-ish framework that uses Objectified as its rendering engine... 
* The most interesting part is that this is all Objects nothing more... never any HTML...
* its not like i dont like HTML... i just am thinking this is something that would be 
* interesting to some... plus someone said it was wasteful to develop my own MVC...
* @namespace window.Personified
*/

(function (root, factory){
    if(root.navigator){
        if (typeof exports === "object" && exports) {
            // CommonJS
            factory(exports);
        } else {
            var personified = {};
            factory(root, personified);
            if (typeof define === "function" && define.amd) {
                // AMD
                define(personified);
            } else {
                root.Personified = personified;
                //  console.log("like usual");
            }
        }
    } else {
        //  console.log("node world");
        root = factory(root, factory, true);
    }
}(this, function (globalObj, personified, emulateDocumentBool){

    var emulateDocumentBool = emulateDocumentBool || false,
    	d = globalObj.document;

    //  UTILS
    function throwOne(text){
        if(failSilently){
            if(console && console.log){
                console.log(text);
            }
        } else {
            throw new Error(text);
        }
    }
    //  END UTILS

    function extend (){
    }

	personified.name = "Personified.js";
	personified.version = "0.0.0";

    return personified;
}));
