/**
 *
 * Backbone-DocumentModel v0.6.4
 *
 * PATCHED: Serialize is patched to properly handle nested collections
 *
 * Copyright (c) 2013 Michael Haselton & Aaron Herres, Loqwai LLC
 *
 * https://github.com/icereval/backbone-documentmodel
 * Licensed under the MIT License
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else if (typeof exports !== 'undefined') {
        // CommonJS / Node.js
        module.exports = factory(require('underscore'), require('backbone'));
    } else {
        // globals
        factory(_, Backbone);
    }
}(function (_, Backbone) {
    // Can get overridden to determine the nested model class based on passed values.
    function documentModelGetNestedModel(nestedKey, value, options) {
        return new Backbone.DocumentModel(value, options);
    }

    // Can get overridden to determine the nested collection class based on passed values.
    function documentModelGetNestedCollection(nestedKey, value, options) {
        return new Backbone.DocumentCollection(value, options);
    }

    function documentCollectionGet(obj) {
        if (this.pseudoIdAttribute) {
            return this.findWhere({value: obj});
        }

        return Backbone.Collection.prototype.get.call(this, obj);
    }

    function documentModelGet(property) {
        if (!_.isString(property)) {
            return Backbone.Model.prototype.get.call(this, property);
        }

        var properties = _.isArray(property) ? property : property.split('.');
        var retVal = Backbone.Model.prototype.get.call(this, properties.shift());

        if (retVal === undefined) {
            return undefined;
        }

        _.each(properties, function (prop) {
            var parseIntProp;

            if (retVal !== undefined) {
                parseIntProp = parseInt(prop, 10);

                retVal = _.isFinite(parseIntProp) ? retVal.at(parseIntProp) : retVal.get(prop);

                // If the value is a 'pseudo' object go ahead and retrieve its 'value' attribute.
                if (retVal !== undefined && retVal.collection && retVal.collection.pseudoIdAttribute) {
                    retVal = retVal.get('value');
                }
            }
        }, this);

        return retVal;
    }

    function documentCollectionSet(models, options) {
        options || (options = {});

        // Model's within Collections do not store parent/name, this can be accessed
        // through the model's collection attribute.
        delete options.name;
        delete options.parent;

        return Backbone.Collection.prototype.set.call(this, models, options);
    }

    function documentModelPrepare(attrs, options) {
        _.extend(options, _.pick(this.idAttribute ? this : _.isObject(attrs) ? attrs : this, ['idAttribute']));

        // If we are parsing an array or values we'll need to generate a pseudoIdAttribute.
        if (Object.prototype.toString.call(attrs) !== '[object Object]' || _.isArray(attrs)) {
            // #5 - Ensure we do not omit wrapped primitives.
            var value = attrs;

            this.pseudoIdAttribute = true;

            attrs = {};
            attrs[options.idAttribute] = _.uniqueId();
            attrs.value = value;
        }

        return Backbone.Collection.prototype._prepareModel.call(this, attrs, options);
    }

    function documentModelSet(key, val, options) {
        var attrs,
            isBackboneObj,
            nestedAttrs = {},
            deepNamedAttrs = {};

        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options || (options = {});

        // If the object is already a Collection or Model assume its a Document object.
        isBackboneObj =  attrs instanceof Backbone.Collection || attrs instanceof Backbone.Model;

        if (!isBackboneObj) {
            _.each(_.keys(attrs), function (attrKey) {
                if (attrKey.indexOf('.') > 0) {
                    deepNamedAttrs[attrKey] = attrs[attrKey];
                    delete attrs[attrKey];
                } else if (Object.prototype.toString.call(attrs[attrKey]) === '[object Object]' || _.isArray(attrs[attrKey])) {
                    // #5 - Ensure we do not omit wrapped primitives.
                    nestedAttrs[attrKey] = attrs[attrKey];
                    delete attrs[attrKey];
                }
            });
        }

        if (!Backbone.Model.prototype.set.call(this, attrs, options)) return false;

        if (!isBackboneObj) {
            // Refactor Deep Named Attributes ( ex: { 'name.first': 'Joe' } ) into Objects/Arrays for nested attribute merge.
            _.each(_.keys(deepNamedAttrs), function (deepAttrKey) {
                var splitDeepAttrs = deepAttrKey.split('.'),
                    deepAttrName = splitDeepAttrs.pop(),
                    deepAttrHandled = false;

                var parentNestedAttr = nestedAttrs;

                for (var i = 0; i < splitDeepAttrs.length; i++) {
                    var splitDeepAttrKey = splitDeepAttrs[i],
                        childSplitDeepAttrKey = splitDeepAttrs[i + 1];

                    if (_.isFinite(childSplitDeepAttrKey)) {
                        var deepAttrParentName = _.reduce(splitDeepAttrs, function (memo, val) {
                                return memo + '.' + val;
                            }),
                            deepAttrParent = this.get.call(this, deepAttrParentName);

                        if (deepAttrParent) {
                            deepAttrParent.set(deepAttrName, deepNamedAttrs[deepAttrKey], options);
                        }

                        deepAttrHandled = true;

                        break;
                    } else {
                        if (!parentNestedAttr[splitDeepAttrKey]) {
                            parentNestedAttr[splitDeepAttrKey] = {};
                        }

                        parentNestedAttr = parentNestedAttr[splitDeepAttrKey];
                    }
                }

                if (!deepAttrHandled) {
                    parentNestedAttr[deepAttrName] = deepNamedAttrs[deepAttrKey];
                }
            }, this);

            // Handle Nested Attribute Creation - ex: { name: { first: 'Joe' } }
            _.each(_.keys(nestedAttrs), function (nestedAttrKey) {
                var nestedOptions;
                var nestedValue = nestedAttrs[nestedAttrKey];
                // If the attribute already exists, merge the objects.
                if (this.attributes[nestedAttrKey]) {
                    this.attributes[nestedAttrKey].set.call(this.attributes[nestedAttrKey], nestedValue, options);
                } else {
                    nestedOptions = { parent: this };
                    _.extend(nestedOptions, _.pick(this, ['idAttribute']));
                    nestedOptions.name = nestedAttrKey;

                    if (_.isArray(nestedValue)) {
                        // Collection
                        Backbone.Model.prototype.set.call(this, nestedAttrKey, this.getNestedCollection(nestedAttrKey, nestedValue, nestedOptions), options);
                    }  else {
                        // Model
                        if (this instanceof Backbone.DocumentModel) {
                            // Model -> Model
                            if (nestedValue instanceof Backbone.DocumentModel) {
                                if (!nestedValue.get(this.idAttribute)) {
                                    // If no id has was specified for the nested Model, use it's parent id.
                                    // This is required for patching updates and will be omitted on JSON build.
                                    nestedValue.set(this.idAttribute, this.get(this.idAttribute), {silent:true});
                                    nestedOptions.pseudoIdAttribute = true;
                                }
                                _.extend(nestedValue, nestedOptions);
                                Backbone.Model.prototype.set.call(this, nestedAttrKey, nestedValue, options);
                            } else if (!nestedValue[this.idAttribute]) {
                                // If no id has was specified for the nested Model, use it's parent id.
                                // This is required for patching updates and will be omitted on JSON build.
                                nestedValue[this.idAttribute] = this.get(this.idAttribute);
                                nestedOptions.pseudoIdAttribute = true;
                                Backbone.Model.prototype.set.call(this, nestedAttrKey, this.getNestedModel(nestedAttrKey, nestedValue, nestedOptions), options);
                            }
                        }
                    }
                }
            }, this);
        }

        return this;
    }

    function documentToJSON() {
        var omitList = [],
            response;

        if (this instanceof Backbone.Collection) {
            var models = this.models;
            response = [];

            _.each(_.keys(models), function (modelKey) {
                var modelValues = models[modelKey].toJSON();

                response.push(modelValues);
            }, this);
        } else if (this instanceof Backbone.Model && this.attributes) {
            var attributes = this.attributes;
            response = {};

            // #7 - Strange output on nested collection models toJSON()
            if (this.collection && this.collection.pseudoIdAttribute) {
                response = this.get('value').toJSON();
            } else {
                _.each(_.keys(attributes), function (attrKey) {
                    if (attributes[attrKey] instanceof Backbone.Model || attributes[attrKey] instanceof Backbone.Collection) {
                        omitList.push(attrKey);
                    }
                });

                // clear pseudo parent id reference.
                if (this.pseudoIdAttribute) {
                    delete attributes[this.idAttribute];
                }

                response = _.omit(attributes, omitList);

                _.each(omitList, function (omitKey) {
                    response[omitKey] = attributes[omitKey].toJSON();
                });
            }
        }

        return response;
    }

    function documentEvents(eventName) {
        var eventSplit = eventName.split(':'),
            eventType = eventSplit[0],
            eventAttrs = eventSplit.length > 1 ? _.last(eventSplit, eventSplit.length - 1)[0].split('.') : [],
            args = Array.prototype.slice.call(arguments, 0);

        //console.log('DocumentEvent:event:this (' + this.name + ') [' + (this instanceof Backbone.Model ? 'M' : 'C') + ']:' + eventName);

        if (eventName === 'change') {
            return;
        }

        // Only trigger events on Models, Collections automatically replicate Child Model events.
        eventAttrs.unshift(this.name);

        var event = _.reduce(eventAttrs, function (memo, val) {
            return memo + '.' + val;
        });

        args[0] = eventType + ':' + event;

        //console.log('DocumentEvent:trigger:this (' + this.name + ') [' + (this instanceof Backbone.Model ? 'M' : 'C') + ']:parent (' + (this.parent.name || (this.parent.collection ? this.parent.collection.name : 'undefined')) + ') [' + (this.parent instanceof Backbone.Model ? 'M' : 'C') + ']:' + args[0]);
        this.parent.trigger.apply(this.parent, args);
    }

    function documentTrigger(name) {
        Backbone.Events.trigger.apply(this, arguments);

        if (this._events) {
            var eventMatches = _.filter(_.keys(this._events), function (eventKey) {
                var match = false;

                // Do not trigger on an exact match
                if (name !== eventKey) {
                    if (name.substring(0, 6) === 'change') {
                        if (name.indexOf('.') >= 0) {
                            match = true;
                        }
                    } else {
                        match = true;
                    }
                }

                return match && eventKey.indexOf(':') >= 0 && name.indexOf(':') >= 0 && name.match(eventKey);
            });

            if (eventMatches.length) {
                var args = Array.prototype.slice.call(arguments, 0);

                _.each(eventMatches, function (event) {
                    args[0] = event;
                    Backbone.Events.trigger.apply(this, args);
                }, this);
            }
        }
    }

    function documentSave(key, val, options) {
        // ensure save is executed from the highest document model.
        var obj = this;

        while (obj.parent || (obj.collection && obj.collection.parent)) {
            obj = obj.parent || obj.collection.parent;
        }

        return Backbone.Model.prototype.save.call(obj, key, val, options);
    }

    function documentClone() {
        return new this.constructor(this.toJSON());
    }

    var DocumentModel = Backbone.Model.extend({
        constructor: function (models, options) {
            options || (options = {});
            _.extend(this, _.pick(options, ['idAttribute', 'parent', 'name', 'pseudoIdAttribute',
                'getNestedModel', 'getNestedCollection']));
            Backbone.Model.apply(this, arguments);

            this.on('all', function () {
                if (this.parent && this.name) {
                    documentEvents.apply(this, arguments)
                }
            }, this);
        },
        pseudoIdAttribute: false,
        toJSON: documentToJSON,
        get: documentModelGet,
        set: documentModelSet,
        save: documentSave,
        clone: documentClone,
        trigger: documentTrigger,
        getNestedModel: documentModelGetNestedModel,
        getNestedCollection: documentModelGetNestedCollection
    });

    var DocumentCollection = Backbone.Collection.extend({
        constructor: function (models, options) {
            options || (options = {});
            _.extend(this, _.pick(options, ['idAttribute', 'parent', 'name']));
            Backbone.Collection.apply(this, arguments);

            this.on('all', function () {
                if (this.parent && this.name) {
                    documentEvents.apply(this, arguments)
                }
            }, this);
        },
        pseudoIdAttribute: false,
        model: DocumentModel,
        toJSON: documentToJSON,
        get: documentCollectionGet,
        set: documentCollectionSet,
        clone: documentClone,
        trigger: documentTrigger,
        _prepareModel: documentModelPrepare
    });

    //Exports
    Backbone.DocumentModel = DocumentModel;
    Backbone.DocumentCollection = DocumentCollection;

    //For use in NodeJS
    if (typeof module != 'undefined') module.exports = DocumentModel;

    return Backbone;
}));