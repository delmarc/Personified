/**
* This is an attempt at making an MVC-ish framework that uses Objectified as its rendering engine... 
* The most interesting part is that this is all Objects nothing more... never any HTML...
* its not like i dont like HTML... i just am thinking this is something that would be 
* interesting to some... plus someone said it was wasteful to develop my own MVC...
* @namespace window.Personified
*/

;(function (root, factory){
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
        _eventCount = 0,
        _randNumCount = 0,
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
        this.models = {};
        this.views = {};
        this.controllers = {};

        this.collections = {};

        return this;
    }

    function create(createObj, mvcState){
        // this is what will be the new init

        if(!mvcState){
            return new throwOne("When creating, I need to know what state that it is happening in...");
        }

        if(this instanceof personified){
            console.log( this instanceof personified , "I am");
        } else {

            PersonifiedApp = new personified(createObj);

            createBaseObj.call(PersonifiedApp);

            if(createObj.model){
                PersonifiedApp.createModel(createObj.model, mvcState);
            }

            if(createObj.collection){
                PersonifiedApp.createCollection(createObj.collection, mvcState);
            }

            if(createObj.view && createObj.view.render){
                PersonifiedApp.createView(createObj.view, mvcState);
            }

            if(createObj.controller){
                PersonifiedApp.createController(createObj.controller, mvcState);
            }

            console.log(createObj);

        }

        howeverYouDoEvents(personifiedPubSubDOMModule, mvcState, noop);

        return PersonifiedApp;
    }

    function createView (createViewObject,viewState){
        if( !createViewObject ){
            return throwOne("I have to get both a object to base the view on");
        }
        if( !viewState ){
            return throwOne("I have to get a view state that this will belong to");
        }

        var viewObj,
            dropViewPoint,
            referenceAnchor;

        console.log(createViewObject);

        if(createViewObject.useCollection || createViewObject.useModel){

            if(createViewObject.useCollection){
                viewObj = Objectified.render(createViewObject.render, 
                    this.collections[viewState]
                );
            } else {
                console.log(this);
                viewObj = Objectified.render(createViewObject.render, this.models[viewState].base);
            }

        } else {
            viewObj = Objectified.render(createViewObject.render);
        }

        if(this.views[viewState] && this.views[viewState].template){
            console.log("I already have this view");
        } else {
            console.log("create this view");
            this.views[viewState] = {
                template : viewObj.cloneNode(true)
            };
        }

        referenceAnchor = this.views[viewState].template.childNodes[0];

        if(dropViewPoint = d.getElementById(createViewObject.placement)){
            //dropViewPoint.appendChild(this.views[viewState].template);
            dropViewPoint.appendChild(this.views[viewState].template);
        } else {
            // drop in the body
            d.body.appendChild(this.views[viewState].template);
        }

        this.views[viewState].view = referenceAnchor.parentNode;
        this.views[viewState].viewSelfReference = referenceAnchor;

        this.views[viewState].template = viewObj;
        if(this.models && this.models[viewState]){
            this.views[viewState].model = this.models[viewState];
        }
        if(this.collections && this.collections[viewState]){
            this.views[viewState].collection = this.collections[viewState];
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


        // this can be combined...
        if(createControllerObj.events && this.views[controllerState]){
            for(var elementEventBinding in createControllerObj.events){
                var referenceElementNodeList = this.views[controllerState].view.querySelectorAll(elementEventBinding);

                for(var i=0;i<referenceElementNodeList.length;i++){
                    for(var onEvent in createControllerObj.events[elementEventBinding].on){

                        referenceElementNodeList[i]["on"+onEvent] = function(instanceControllerStateRef, instanceElementEventBinding, instanceOnEvent){

                            return function(ev){

                                try{
                                    return createControllerObj[ createControllerObj.events[instanceElementEventBinding].on[instanceOnEvent] ].call(selfPersonifiedApp.views[instanceControllerStateRef],ev);
                                } catch(er){
                                    return console.log(er, "uhh you dont have a function by that name");
                                }

                            };
                        }.call(referenceElementNodeList[i], controllerState, elementEventBinding, onEvent);

                    }
                }

            }
        } else {
            for(var elementEventBinding in createControllerObj.events){
                var referenceElementNodeList = d.querySelectorAll(elementEventBinding);
                for(var i=0;i<referenceElementNodeList.length;i++){

                    for(var onEvent in createControllerObj.events[elementEventBinding].on){

                        referenceElementNodeList[i]["on"+onEvent] = function(instanceControllerStateRef, instanceElementEventBinding, instanceOnEvent){
                            return function(ev){

                                try{
                                    return createControllerObj[ createControllerObj.events[instanceElementEventBinding].on[instanceOnEvent] ].call(selfPersonifiedApp,ev);
                                } catch(er){
                                    return console.log(er, "uhh you dont have a function by that name");
                                }

                            };
                        }.call(referenceElementNodeList[i], controllerState, elementEventBinding, onEvent);

                    }

                }
            }
        }

        if(createControllerObj.bindings){

        }

        if(createControllerObj.render){

        }

    	return this;
    }

    // model work
    function createModel (createModelObj,modelState){
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
            if(this.views && this.views[modelState]){
                this.views[modelState].model = this.models[modelState];
            }
            howeverYouDoEvents(personifiedPubSubDOMModule, modelState+"Action", this.models[modelState].handler);
        }

    	return this;
    }

    function createBaseModelObj(modelToCreateFrom, modelName, modelFromCollectionBool){
        var selfModelObj,
            _altered = false;

        function personifiedBaseModel(modelToCreateFrom){
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

        personifiedBaseModel.prototype.handler = function(ev){
            var handlersDOMInstance = this.getElementById(selfModelObj.name+"-Model-"+_eventCount+"-"+ev.timeStamp),
                baseModelsController = PersonifiedApp.controllers && PersonifiedApp.controllers[modelName],
                baseModelsView = PersonifiedApp.views && PersonifiedApp.views[modelName];

            if(handlersDOMInstance){
                switch(handlersDOMInstance.action){
                    case "set":
                        selfModelObj.changed[handlersDOMInstance.setProp] = handlersDOMInstance.setData;
                        _altered = true;
                        break;
                    case "revertSingle":
                        selfModelObj.changed[handlersDOMInstance.setProp] = selfModelObj.base[handlersDOMInstance.setProp];
                        selfModelObj.live[handlersDOMInstance.setProp] = selfModelObj.base[handlersDOMInstance.setProp];
                        break;
                    case "revert":
                        selfModelObj.changed = selfModelObj.base;
                        selfModelObj.live = selfModelObj.base;
                        _altered = false;
                        break;
                }

                if(baseModelsView){
                    if(baseModelsController.update){
                        var nodesToUpdateCount;
                        console.log(
                            "update", 
                            baseModelsView.viewSelfReference, 
                            baseModelsView.viewSelfReference.querySelectorAll("[data-change-on-update]").length
                        );

                        if(nodesToUpdateCount = baseModelsView.viewSelfReference.querySelectorAll("[data-change-on-update]").length){
                            var nodesToUpdate = baseModelsView.viewSelfReference.querySelectorAll("[data-change-on-update]");
                            for(var i=0;i<nodesToUpdateCount;i++){
                                console.log(nodesToUpdate[i]);
                                console.log(nodesToUpdate[i].bitching);
                                console.log(nodesToUpdate[i].dataBindedAttributes);
                                console.log(nodesToUpdate[i].bindedAttributesMapping);

                                console.log(baseModelsView);
                                nodesToUpdate[i][ nodesToUpdate[i].getAttribute("data-change-on-update") ] = "SET HERE";
                            }
                        } else {
                            console.log("nothing to update");
                        }


                    } else if (baseModelsController.render){
                        console.log("render", baseModelsView.viewSelfReference);
                    }

                    /*
                    if(baseModelsController.render){
                        baseModelsView.viewSelfReference.parentNode.removeChild(baseModelsView.viewSelfReference);

                        var newViewInstance = baseModelsView.template.cloneNode(true);
                        var referenceAnchor = newViewInstance.childNodes[0];

                        baseModelsView.view.appendChild(newViewInstance);
                        baseModelsView.viewSelfReference = referenceAnchor;

                        createController.call(PersonifiedApp, baseModelsController, modelName); 

                        baseModelsController.render();
                    }

                    if(baseModelsController.update){
                        console.log(baseModelsView)
                        if(baseModelsView.template.querySelectorAll("[data-change-on-update]").length){

                        }
                        baseModelsController.update();
                    }
                    */

                }

                handlersDOMInstance.parentNode.removeChild(handlersDOMInstance);

                return selfModelObj.changed;

            }
        };

        personifiedBaseModel.prototype.name = modelName;

        personifiedBaseModel.prototype.get = function(modelProp){

            if(!modelProp){
                return throwOne("Cant get nothing if you dont tell me what to get");
            }

            if(this.base.hasOwnProperty(modelProp)){
                if(_altered){
                    return this.live[modelProp];
                } else {
                    return this.base[modelProp];
                }
            } else {
                return null;
            }

        };

        personifiedBaseModel.prototype.set = function(modelProp, dataToSet){

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
                        "id":this.name+"-Model-"+_eventCount+"-"+setEvent.timeStamp
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

        personifiedBaseModel.prototype.revert = function(modelPropToRevert){
            /* 
                if something is passed then revert just that...
                otherwise revert all
            */

            var setEvent = document.createEvent("MouseEvents"),
                setElem;

            if(modelPropToRevert){
                this.live[modelPropToRevert] = this.base[modelPropToRevert];
                this.changed[modelPropToRevert] = this.base[modelPropToRevert];

                setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

                setElem = Objectified.render({
                    "tag":"span",
                    "attributes":{
                        "id":this.name+"-Model-"+_eventCount+"-"+setEvent.timeStamp
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

                setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

                setElem = Objectified.render({
                    "tag":"span",
                    "attributes":{
                        "id":this.name+"-Model-"+_eventCount+"-"+setEvent.timeStamp
                    }
                });

                // need a better way to do this
                setElem.childNodes[0].action = "revert";

                personifiedPubSubDOMModule.appendChild(setElem);

                personifiedPubSubDOMModule.dispatchEvent(setEvent);

                return this.changed;
            }

        };

        if(modelFromCollectionBool){
            personifiedBaseModel.prototype.id = modelName+"-"+(_randNumCount++);
        }        

        selfModelObj = new personifiedBaseModel(modelToCreateFrom);

        return selfModelObj;
    }
    // end model work


    // collection work
    function createCollection(createCollectionObj, collectionState){

        if( !createCollectionObj ){
            return throwOne("I have to get both a object to base the collection on");
        }
        if( !collectionState ){
            return throwOne("I have to get a collection state that this will belong to");
        }

        if(this.collections[collectionState]){
            console.log("I already have this collection");
        } else {
            console.log("create this collection");
            this.collections[collectionState] = createBaseCollectionObj(createCollectionObj, collectionState);
            if(this.views && this.views[collectionState]){
                this.views[collectionState].collection = this.collections[collectionState];
            }
            howeverYouDoEvents(personifiedPubSubDOMModule, collectionState+"Action", this.collections[collectionState].handler);
        }

        return this;

    }

    function createBaseCollectionObj(collectionToCreateFrom, collectionName){

        var selfCollectionObj,
            _altered = false;

        function personifiedBaseCollection(collectionToCreateFrom){
            var instance;
            this.base = {};
            this.live = {};
            this.changed = {};

            //for(var prop in collectionToCreateFrom){
            for(var i=0; i<collectionToCreateFrom.length;i++){
                instance = createBaseModelObj( collectionToCreateFrom[i], collectionName, true );

                this.base[instance.id] = instance;
                this.live[instance.id] = instance;
                this.changed[instance.id] = instance;
            }

            return this;
        }

        personifiedBaseCollection.prototype.handler = function(ev){
            var handlersDOMInstance = this.getElementById(selfCollectionObj.name+"-Collection-"+_eventCount+"-"+ev.timeStamp);
            console.log(handlersDOMInstance, handlersDOMInstance.action)

            if(handlersDOMInstance){

                switch(handlersDOMInstance.action){
                    case "add":
                        selfCollectionObj.changed[handlersDOMInstance.setProp] = handlersDOMInstance.setData;
                        _altered = true;
                        break;
                    case "remove":
                        selfCollectionObj.changed[handlersDOMInstance.setProp] = handlersDOMInstance.setData;
                        _altered = true;
                        break;
                }

                handlersDOMInstance.parentNode.removeChild(handlersDOMInstance);

                return selfCollectionObj.changed;

            }

        };

        personifiedBaseCollection.prototype.name = collectionName;

        personifiedBaseCollection.prototype.get = function(collectionProp){
        };

        personifiedBaseCollection.prototype.set = function(collectionProp, dataToSet){
        };

        personifiedBaseCollection.prototype.add = function(collectionItemToBeAdded){
            if(!collectionItemToBeAdded){
                return throwOne("I need to given something to add to the collection");
            }

            if(collectionItemToBeAdded.length){
                // and array of X
                for(var i=0;i<collectionItemToBeAdded.length;i++){
                    this.live[this.name+"-"+(_randNumCount++)] = createBaseModelObj(collectionItemToBeAdded[i], collectionName, true);
                }
            } else {
                // single instance of X to add
                this.live[this.name+"-"+(_randNumCount++)] = createBaseModelObj(collectionItemToBeAdded, collectionName, true);
            }

            var setEvent = document.createEvent("MouseEvents");

            setEvent.initMouseEvent(this.name+"Action", true, true, window, (++_eventCount),0,0,0,0, false,false,false, false,0,null);

            var setElem = Objectified.render({
                "tag":"span",
                "attributes":{
                    "id":this.name+"-Collection-"+_eventCount+"-"+setEvent.timeStamp
                }
            });

            // need a better way to do this
            setElem.childNodes[0].setProp = this.name;
            setElem.childNodes[0].setData = collectionItemToBeAdded;
            setElem.childNodes[0].action = "add";

            personifiedPubSubDOMModule.appendChild(setElem);

            personifiedPubSubDOMModule.dispatchEvent(setEvent);

            return this.changed;
        };

        personifiedBaseCollection.prototype.remove = function(collectionItemToBeRemoved){
            if(!collectionItemToBeRemoved){
                return throwOne("I need to given something to remove from the collection");
            }

            if(collectionItemToBeRemoved instanceof personifiedBaseModel){
                console.log("hello this is a base model...");
            } else {
                console.log("not a base model...");

            }
        };

        personifiedBaseCollection.prototype.revert = function(modelPropToRevert){
        };

        selfCollectionObj = new personifiedBaseCollection(collectionToCreateFrom);

        return selfCollectionObj;

    }
    // end collection work

    // start endpoints
    // end endpoints


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

    // called to create the parts of the MVC
    personified.prototype.createModel = createModel;
    personified.prototype.createView = createView;
    personified.prototype.createController = createController;

    personified.prototype.createCollection = createCollection;

    personified.prototype.hazModel = noop;
    personified.prototype.hazView = noop;
    personified.prototype.hazController = noop;
    personified.prototype.hazCollection = noop;

    personified.prototype.create = create;

    // this is where it all begins
    function init (createObj){

        return create(createObj, "init");

    }

    function extend(extendingObjOrURL){
        if(!extendingObjOrURL){
            return throwOne("I think it would be good to at least give me an object to start with - err-0");
        }

        if(typeof extendingObjOrURL === "string"){
            var extendingScript = Objectified.render({
                "tag":"script",
                "attributes":{
                    "src":extendingObjOrURL
                }
            });

            extendingScript.onload = function(){

            }

            extendingScript.onerror = function(){

            }

            d.body.appendChild(extendingScript);


        } else if(typeof extendingObjOrURL !== "object" || typeof extendingObjOrURL.length === "number" ){
            return throwOne("You either gave me something that is not an object like i am expecting, or probably an array");
        }

        /*
        for(var objectItem in extendingObjOrURL){
            this[objectItem] = extendingObjOrURL[objectItem];
        }
        */

        return this;        
    }

    /* 
        this will basically give the developer the chance to extend as to what personified does...
        well eventually it will...
    */
    personified.prototype.extend = extend;

    personifiedSelf.init = init;
    personifiedSelf.create = create;
    personifiedSelf.createModel = createModel;
    personifiedSelf.createView = createView;
    personifiedSelf.createController = createCollection;

	personifiedSelf.name = "Personified.js";
	personifiedSelf.version = "0.1.0";

	personifiedSelf.atTheTime = {
		song : "Pimp Mode",
		artist : "Chamillionaire"
	};

    return personifiedSelf;
}));
