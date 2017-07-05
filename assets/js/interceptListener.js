// From https://stackoverflow.com/questions/9046741/get-event-listeners-attached-to-node-using-addeventlistener

exports.ListenerTracker=new function(){
    var is_active=false;
    // listener tracking datas
    var _elements_  =[];
    var _listeners_ =[];
    this.init=function(){
        if(!is_active){//avoid duplicate call
            intercep_events_listeners();
        }
        is_active=true;
    };
    // register individual element an returns its corresponding listeners
    var register_element=function(element){
        if(_elements_.indexOf(element)==-1){
            // NB : split by useCapture to make listener easier to find when removing
            var elt_listeners=[{/*useCapture=false*/},{/*useCapture=true*/}];
            _elements_.push(element);
            _listeners_.push(elt_listeners);
        }
        return _listeners_[_elements_.indexOf(element)];
    };
    var intercep_events_listeners = function(){
        // backup overrided methods
        var _super_={
            "addEventListener"      : HTMLElement.prototype.addEventListener,
            "removeEventListener"   : HTMLElement.prototype.removeEventListener
        };

        Element.prototype["addEventListener"]=function(type, listener, useCapture){
            var listeners=register_element(this);
            // add event before to avoid registering if an error is thrown
            _super_["addEventListener"].apply(this,arguments);
            // adapt to 'elt_listeners' index
            useCapture=useCapture?1:0;

            if(!listeners[useCapture][type])listeners[useCapture][type]=[];
            listeners[useCapture][type].push(listener);
        };
        Element.prototype["removeEventListener"]=function(type, listener, useCapture){
            var listeners=register_element(this);
            // add event before to avoid registering if an error is thrown
            _super_["removeEventListener"].apply(this,arguments);
            // adapt to 'elt_listeners' index
            useCapture=useCapture?1:0;
            if(!listeners[useCapture][type])return;
            var lid = listeners[useCapture][type].indexOf(listener);
            if(lid>-1)listeners[useCapture][type].splice(lid,1);
        };
        Element.prototype["getEventListeners"]=function(type){
            var listeners=register_element(this);
            // convert to listener datas list
            var result=[];
            for(var useCapture=0,list;list=listeners[useCapture];useCapture++){
                if(typeof(type)=="string"){// filtered by type
                    if(list[type]){
                        for(var id in list[type]){
                            result.push({"type":type,"listener":list[type][id],"useCapture":!!useCapture});
                        }
                    }
                }else{// all
                    for(var _type in list){
                        for(var id in list[_type]){
                            result.push({"type":_type,"listener":list[_type][id],"useCapture":!!useCapture});
                        }
                    }
                }
            }
            return result;
        };
    };
}();
exports.ListenerTracker.init();