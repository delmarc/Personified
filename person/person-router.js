/**
* This is an attempt at making an MVC-ish framework that uses Objectified as its rendering engine... 
* The most interesting part is that this is all Objects nothing more... never any HTML...
* its not like i dont like HTML... i just am thinking this is something that would be 
* interesting to some... plus someone said it was wasteful to develop my own MVC...
* @namespace window.Personified
*/

;(function (root, factory){

    if(root.Personified){

        if(root.navigator){
            if (typeof exports === "object" && exports) {
                // CommonJS
                factory(exports);
            } else {
                root.Personified.router = {};
                factory(root, root.Personified);
                if (typeof define === "function" && define.amd) {
                    // AMD
                    define(root.Personified);
                } else {
                    root.Personified.router = root.Personified.router;
                    //  console.log("like usual");
                }
            }
        } else {
            //  console.log("node world");
            root = factory(root, factory, true);
        }        

    } else {
        console.log("It would seem you are loading things all over the place, we like Personified to be first");
    }

}(this, function (globalObj, personifiedSelf){
    var routerObject = personifiedSelf.router;

    console.log(personifiedSelf);
    return personifiedSelf;
}));
