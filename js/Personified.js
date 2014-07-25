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
        failSilently = false,
        personifiedPubSubDOMModule = null,
        noop = function(){};

    globalObj.Objectified = Objectified;
    emulateDocumentBool = emulateDocumentBool || false;

    //  UTILS
    function throwOne(text){

        if(failSilently){

			console && console.log && console.log(text);

        } else {

            throw new Error(text);

        }

    }

    function howeverYouDoEvents(objEle, whatAction, aF) {
        if (d.body.addEventListener) {
            howeverYouDoEvents = function (objEle, whatAction, aF) {
                if (!objEle.actions) {
                    objEle.actions = {};
                }
                objEle.actions[whatAction] = aF;
                objEle.addEventListener(whatAction, objEle.actions[whatAction],  false);
            };
        } else {
            howeverYouDoEvents = function (objEle, whatAction, aF) {
                if (!objEle.actions) {
                    objEle.actions = {};
                }
                objEle.actions[whatAction] = aF;
                objEle.attachEvent(whatAction, objEle.actions[whatAction]);
            };
        }
        howeverYouDoEvents(objEle, whatAction, aF);
    }

    function howeverYouDoEventsJustStop(objEle, whatAction) {
        if (d.body.removeEventListener) {
            howeverYouDoEventsJustStop = function (objEle, whatAction) {
                objEle.removeEventListener(whatAction, objEle.actions[whatAction],  false);
                delete objEle.actions[whatAction];
            };
        } else {
            howeverYouDoEventsJustStop = function (objEle, whatAction) {
                objEle.detachEvent("on"+whatAction, objEle.actions[whatAction]);
                delete objEle.actions["on"+whatAction];
            };
        }
        howeverYouDoItJustStop(objEle, whatAction);
    }
    //  END UTILS


    function createBaseObj(){
        this.views = {};
        this.controllers = {};
        this.models = {};

        return this;
    }

    function createMVC(){
        // this is what will be the new init
        return this;
    }


    function createView (createViewObject,viewState){
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
            };
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

                        referenceElementNodeList[i]["on"+onEvent] = function(instanceControllerStateRef, instanceElementEventBinding, instanceOnEvent){
                            return function(ev){

                                if(selfPersonifiedApp.models && selfPersonifiedApp.models[instanceControllerStateRef]){
                                    return createControllerObj[ createControllerObj.events[instanceElementEventBinding].on[instanceOnEvent] ].call(selfPersonifiedApp.models[instanceControllerStateRef],ev);
                                } else {
                                    return createControllerObj[ createControllerObj.events[instanceElementEventBinding].on[instanceOnEvent] ].call(this,ev);
                                }

                            };
                        }.call(referenceElementNodeList[i], controllerState, elementEventBinding, onEvent);

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
            this.models[modelState] = createBaseModelObj(createModelObj, modelState);
            howeverYouDoEvents(personifiedPubSubDOMModule, modelState+"Action", this.models[modelState].handler);
        }

    	return this;
    }

    function createBaseModelObj(modelToCreateFrom, modelName){
        var _eventCount = 0,
            selfModelObj;

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

        baseModelObject.prototype.handler = function(ev){
            var handlersDOMInstance = this.getElementById(_eventCount+"-"+ev.timeStamp);

            switch(handlersDOMInstance.action){
                case "set":
                    selfModelObj.changed[handlersDOMInstance.setProp] = handlersDOMInstance.setData;
                    break;
                case "revertSingle":
                    selfModelObj.changed[handlersDOMInstance.setProp] = selfModelObj.base[handlersDOMInstance.setProp];
                    selfModelObj.live[handlersDOMInstance.setProp] = selfModelObj.base[handlersDOMInstance.setProp];
                    break;
                case "revert":
                    selfModelObj.changed = selfModelObj.base;
                    selfModelObj.live = selfModelObj.base;
                    break;
            }

            handlersDOMInstance.parentNode.removeChild(handlersDOMInstance);

            return selfModelObj.changed;
        };

        baseModelObject.prototype.name = modelName;

        baseModelObject.prototype.get = function(modelProp){
            if(!modelProp){
                return throwOne("Cant get nothing if you dont tell me what to get");
            }

            if(this.base.hasOwnProperty(modelProp)){
                return this.base[modelProp];
            } else {
                return null;
            }
        };

        baseModelObject.prototype.set = function(modelProp, dataToSet){
            if(!modelProp){
                return throwOne("Cant set anything if you dont tell me what to set");
            }
            if(!dataToSet){
                return throwOne("Well you want me to set something right... but with what???");
            }

            if(this.base.hasOwnProperty(modelProp)){
                this.live[modelProp] = dataToSet;
                var setEvent = document.createEvent("MouseEvents");

                setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

                var setElem = Objectified.render({
                    "tag":"span",
                    "attributes":{
                        "id":_eventCount+"-"+setEvent.timeStamp
                    }
                });

                // need a better way to do this
                setElem.childNodes[0].setProp = modelProp;
                setElem.childNodes[0].setData = dataToSet;
                setElem.childNodes[0].action = "set";

                personifiedPubSubDOMModule.appendChild(setElem);

                personifiedPubSubDOMModule.dispatchEvent(setEvent);

                return this.changed;
            } else {
                return throwOne("Model property doesnt exist");
            }

        };

        baseModelObject.prototype.revert = function(modelPropToRevert){
            /* 
                if something is passed then revert just that...
                otherwise revert all
            */
            if(modelPropToRevert){
                this.live[modelPropToRevert] = this.base[modelPropToRevert];
                this.changed[modelPropToRevert] = this.base[modelPropToRevert];

                var setEvent = document.createEvent("MouseEvents");

                setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

                var setElem = Objectified.render({
                    "tag":"span",
                    "attributes":{
                        "id":_eventCount+"-"+setEvent.timeStamp
                    }
                });

                // need a better way to do this... actually for now this ok but the props need better names
                setElem.childNodes[0].setProp = modelPropToRevert;
                setElem.childNodes[0].action = "revertSingle";

                personifiedPubSubDOMModule.appendChild(setElem);

                personifiedPubSubDOMModule.dispatchEvent(setEvent);

                return this.changed;
            } else {
                this.live = this.base;
                this.changed = this.base;

                var setEvent = document.createEvent("MouseEvents");

                setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

                var setElem = Objectified.render({
                    "tag":"span",
                    "attributes":{
                        "id":_eventCount+"-"+setEvent.timeStamp
                    }
                });

                // need a better way to do this
                setElem.childNodes[0].action = "revert";

                personifiedPubSubDOMModule.appendChild(setElem);

                personifiedPubSubDOMModule.dispatchEvent(setEvent);

                return this.changed;
            }

        };

        selfModelObj = new baseModelObject(modelToCreateFrom);

        return selfModelObj;
    }




    function personified (baseObjToExtend) {
        //console.log(baseObjToExtend);
        if(Objectified){

        } else {
            return throwOne("OH YOU DONT HAVE Objectified!!!");
        }

        this.views = {};
        this.controllers = {};
        this.models = {};

        personifiedPubSubDOMModule = Objectified.render({
            tag:"div",
            attributes:{
                id:"personifiedPubSubModule"
            }
        });

    	return this;
    }

    /* 
        this will basically give the developer the chance to extend as to what personified does...
        well eventually it will...
    */
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

    // called to create the parts of the MVC
    personified.prototype.createView = createView;
    personified.prototype.createModel = createModel;
    personified.prototype.createController = createController;

    // typically called to start an app
    personified.prototype.createMVC = createMVC;


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

        howeverYouDoEvents(personifiedPubSubDOMModule, "init", noop);

        console.log(PersonifiedApp, personifiedPubSubDOMModule, personifiedPubSubDOMModule.actions);

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
