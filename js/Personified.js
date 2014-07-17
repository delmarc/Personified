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

    function createBaseModelObj(modelToCreateFrom){
        function baseModelObject(modelToCreateFrom){
            this.base = {};
            this.live = {};
            this.changed = {};

            for(var prop in modelToCreateFrom){
                this.base[prop] = modelToCreateFrom[prop];
                this.live[prop] = modelToCreateFrom[prop];
                this.changed[prop] = modelToCreateFrom[prop];
            }

            return this;
        }

        baseModelObject.prototype.get = function(modelProp){
            if(!modelProp){
                return throwOne("Cant get nothing if you dont tell me what to get");
            }

            if(this.base.hasOwnProperty(modelProp)){
                return this.base[modelProp];
            } else {
                return null;
            }
        }
        baseModelObject.prototype.set = function(modelProp, dataToSet){
            if(!modelProp){
                return throwOne("Cant set anything if you dont tell me what to set");
            }
            if(!dataToSet){
                return throwOne("Well you want me to set something right... but with what???");
            }

            

        }
        baseModelObject.prototype.revert = function(){
        }
 
        return new baseModelObject(modelToCreateFrom);
    }


    function createView (createViewObject,viewState){
    	if(Objectified){

    	} else {
    		return throwOne("OH YOU DONT HAVE Objectified!!!");
    	}

        if( !createViewObject ){
            return throwOne("I have to get both a object to base the view on");
        }
        if( !viewState ){
            return throwOne("I have to get a view state that this will belong to");
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
        if( !createControllerObj ){
            return throwOne("I have to get both a object to base the controller on");
        }
        if( !controllerState ){
            return throwOne("I have to get a controller state that this will belong to");
        }

        var selfPersonifiedApp = this;

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

                        referenceElementNodeList[i]["on"+onEvent] = function(ev){
                            if(selfPersonifiedApp.models && selfPersonifiedApp.models[controllerState]){
                                return createControllerObj[ createControllerObj.events[elementEventBinding].on[onEvent] ].call(selfPersonifiedApp.models[controllerState],ev);
                            } else {
                                return createControllerObj[ createControllerObj.events[elementEventBinding].on[onEvent] ].call(this,ev);
                            }
                        }

                    }
                }
            }
        }

    	return this;
    }

    function createModel(createModelObj,modelState){
        if( !createModelObj ){
            return throwOne("I have to get both a object to base the model on");
        }
        if( !modelState ){
            return throwOne("I have to get a model state that this will belong to");
        }

        if(this.models[modelState]){
            console.log("I already have this model");
        } else {
            console.log("create this model");
            this.models[modelState] = createBaseModelObj(createModelObj);
        }




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
