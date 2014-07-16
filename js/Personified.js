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
}(this, function (globalObj, personifiedSelf, emulateDocumentBool){

    var d = globalObj.document,
    	PersonifiedApp = null,
        failSilently = false;

    globalObj.Objectified = Objectified;
    emulateDocumentBool = emulateDocumentBool || false;

    //  UTILS
    function throwOne(text){

        if(failSilently){

			console && console.log && console.log(text)

        } else {

            throw new Error(text);

        }

    }
    //  END UTILS

    function createBaseObj(){
        this.views = {};
        this.controllers = {};
        this.models = {};

        return this;
    }

    function createBaseModelObj(){


        return this;
    }


    function createView (createViewObject,viewState){
    	if(Objectified){

    	} else {
    		return throwOne("OH YOU DONT HAVE Objectified!!!");
    	}

        var viewObj = Objectified.render(createViewObject.render),
            dropViewPoint,
            referenceAnchor;

        if(this.views[viewState] && this.views[viewState].template){
            console.log("I already have this view");
        } else {
            console.log("create this view");
            this.views[viewState] = {
                template : viewObj.cloneNode(true)
            }
        }

        if(dropViewPoint = globalObj.document.getElementById(createViewObject.placement)){
            referenceAnchor = this.views[viewState].template.childNodes[0];

            dropViewPoint.appendChild(this.views[viewState].template);

            this.views[viewState].reference = referenceAnchor.parentNode;
            this.views[viewState].template = viewObj;
        }

    	return this;
    }

    function createController (createControllerObj,controllerState){

        if(this.controllers[controllerState]){
            console.log("I already have this controller");
        } else {
            console.log("create this controller");
            this.controllers[controllerState] = createControllerObj;
        }

        if(createControllerObj.events && this.views[controllerState]){
            for(var elementEventBinding in createControllerObj.events){
                var referenceElementNodeList = this.views[controllerState].reference.querySelectorAll(elementEventBinding);
                for(var i=0;i<referenceElementNodeList.length;i++){
                    for(var onEvent in createControllerObj.events[elementEventBinding].on){
                        // just for testing now
                        referenceElementNodeList[i]["on"+onEvent] = createControllerObj[ createControllerObj.events[elementEventBinding].on[onEvent] ];
                    }
                }
            }
        }

    	return this;
    }

    function createModel (createModelObj,modelState){
    	return this;
    }

    function personified (baseObjToExtend) {
        //console.log(baseObjToExtend);

    	return this;
    }

    personified.prototype.extend = function(extendingObj){
        if(!extendingObj){
            return throwOne("I think it would be good to at least give me an object to start with - err-0");
        }

        if(typeof extendingObj !== "object" || typeof extendingObj.length === "number" ){
            return throwOne("You either gave me something that is not an object like i am expecting, or probably an array");
        }


        for(var objectItem in extendingObj){
            this[objectItem] = extendingObj[objectItem];
        }

        return this;
    };

    personified.prototype.createView = createView;
    personified.prototype.createModel = createModel;
    personified.prototype.createController = createController;



    // this is where it all begins
    function init (createMVCObj){
    	PersonifiedApp = new personified(createMVCObj);

        createBaseObj.call(PersonifiedApp);

        if(createMVCObj.view && createMVCObj.view.render){
            PersonifiedApp.createView(createMVCObj.view,"init");
        }

        if(createMVCObj.controller){
            PersonifiedApp.createController(createMVCObj.controller,"init");
        }

        if(createMVCObj.model){
            PersonifiedApp.createModel(createMVCObj.model,"init");
        }

    	return PersonifiedApp;
    }

	personifiedSelf.init = init;

	personifiedSelf.name = "Personified.js";
	personifiedSelf.version = "0.0.0";

	personifiedSelf.atTheTime = {
		song : "Pimp Mode",
		artist : "Chamillionaire"
	};

    return personifiedSelf;
}));
