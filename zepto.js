/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function (global, factory) {
    if (typeof define === 'function' && define.amd)
        define(function () {
            return factory(global)
        })
    else
        factory(global)
}(this, function (window) {
    var Zepto = (function () {
        var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
            document = window.document,
            elementDisplay = {}, classCache = {},
            cssNumber = {
                'column-count': 1,
                'columns': 1,
                'font-weight': 1,
                'line-height': 1,
                'opacity': 1,
                'z-index': 1,
                'zoom': 1
            },
            fragmentRE = /^\s*<(\w+|!)[^>]*>/,
            singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            rootNodeRE = /^(?:body|html)$/i,
            capitalRE = /([A-Z])/g,

            // special attributes that should be get/set via method calls
            methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

            adjacencyOperators = ['after', 'prepend', 'before', 'append'],
            table = document.createElement('table'),
            tableRow = document.createElement('tr'),
            containers = {
                'tr': document.createElement('tbody'),
                'tbody': table, 'thead': table, 'tfoot': table,
                'td': tableRow, 'th': tableRow,
                '*': document.createElement('div')
            },
            readyRE = /complete|loaded|interactive/,
            simpleSelectorRE = /^[\w-]*$/,
            class2type = {},
            toString = class2type.toString,
            zepto = {},
            camelize, uniq,
            tempParent = document.createElement('div'),
            propMap = {
                'tabindex': 'tabIndex',
                'readonly': 'readOnly',
                'for': 'htmlFor',
                'class': 'className',
                'maxlength': 'maxLength',
                'cellspacing': 'cellSpacing',
                'cellpadding': 'cellPadding',
                'rowspan': 'rowSpan',
                'colspan': 'colSpan',
                'usemap': 'useMap',
                'frameborder': 'frameBorder',
                'contenteditable': 'contentEditable'
            },
            isArray = Array.isArray ||
                function (object) {
                    return object instanceof Array
                }

        zepto.matches = function (element, selector) {
            if (!selector || !element || element.nodeType !== 1) return false
            var matchesSelector = element.matches || element.webkitMatchesSelector ||
                element.mozMatchesSelector || element.oMatchesSelector ||
                element.matchesSelector
            if (matchesSelector) return matchesSelector.call(element, selector)
            // fall back to performing a selector:
            var match, parent = element.parentNode, temp = !parent
            if (temp) (parent = tempParent).appendChild(element)
            match = ~zepto.qsa(parent, selector).indexOf(element)
            temp && tempParent.removeChild(element)
            return match
        }

        function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object"
        }

        function isFunction(value) {
            return type(value) == "function"
        }

        function isWindow(obj) {
            return obj != null && obj == obj.window
        }

        function isDocument(obj) {
            return obj != null && obj.nodeType == obj.DOCUMENT_NODE
        }

        function isObject(obj) {
            return type(obj) == "object"
        }

        function isPlainObject(obj) {
            return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
        }

        function likeArray(obj) {
            var length = !!obj && 'length' in obj && obj.length,
                type = $.type(obj)

            return 'function' != type && !isWindow(obj) && (
                    'array' == type || length === 0 ||
                    (typeof length == 'number' && length > 0 && (length - 1) in obj)
                )
        }

        function compact(array) {
            return filter.call(array, function (item) {
                return item != null
            })
        }

        function flatten(array) {
            return array.length > 0 ? $.fn.concat.apply([], array) : array
        }

        camelize = function (str) {
            return str.replace(/-+(.)?/g, function (match, chr) {
                return chr ? chr.toUpperCase() : ''
            })
        }
        function dasherize(str) {
            return str.replace(/::/g, '/')
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                .replace(/_/g, '-')
                .toLowerCase()
        }

        uniq = function (array) {
            return filter.call(array, function (item, idx) {
                return array.indexOf(item) == idx
            })
        }

        function classRE(name) {
            return name in classCache ?
                classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
        }

        function maybeAddPx(name, value) {
            return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
        }

        function defaultDisplay(nodeName) {
            var element, display
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName)
                document.body.appendChild(element)
                display = getComputedStyle(element, '').getPropertyValue("display")
                element.parentNode.removeChild(element)
                display == "none" && (display = "block")
                elementDisplay[nodeName] = display
            }
            return elementDisplay[nodeName]
        }

        function children(element) {
            return 'children' in element ?
                slice.call(element.children) :
                $.map(element.childNodes, function (node) {
                    if (node.nodeType == 1) return node
                })
        }

        function Z(dom, selector) {
            var i, len = dom ? dom.length : 0
            for (i = 0; i < len; i++) this[i] = dom[i]
            this.length = len
            this.selector = selector || ''
        }

        // `$.zepto.fragment` takes a html string and an optional tag name
        // to generate DOM nodes from the given html string.
        // The generated DOM nodes are returned as an array.
        // This function can be overridden in plugins for example to make
        // it compatible with browsers that don't support the DOM fully.
        zepto.fragment = function (html, name, properties) {
            var dom, nodes, container

            // A special case optimization for a single tag
            if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

            if (!dom) {
                if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
                if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
                if (!(name in containers)) name = '*'

                container = containers[name]
                container.innerHTML = '' + html
                dom = $.each(slice.call(container.childNodes), function () {
                    container.removeChild(this)
                })
            }

            if (isPlainObject(properties)) {
                nodes = $(dom)
                $.each(properties, function (key, value) {
                    if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                    else nodes.attr(key, value)
                })
            }

            return dom
        }

        // `$.zepto.Z` swaps out the prototype of the given `dom` array
        // of nodes with `$.fn` and thus supplying all the Zepto functions
        // to the array. This method can be overridden in plugins.
        zepto.Z = function (dom, selector) {
            return new Z(dom, selector)
        }

        // `$.zepto.isZ` should return `true` if the given object is a Zepto
        // collection. This method can be overridden in plugins.
        zepto.isZ = function (object) {
            return object instanceof zepto.Z
        }

        // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
        // takes a CSS selector and an optional context (and handles various
        // special cases).
        // This method can be overridden in plugins.
        zepto.init = function (selector, context) {
            var dom
            // If nothing given, return an empty Zepto collection
            if (!selector) return zepto.Z()
            // Optimize for string selectors
            else if (typeof selector == 'string') {
                selector = selector.trim()
                // If it's a html fragment, create nodes from it
                // Note: In both Chrome 21 and Firefox 15, DOM error 12
                // is thrown if the fragment doesn't begin with <
                if (selector[0] == '<' && fragmentRE.test(selector))
                    dom = zepto.fragment(selector, RegExp.$1, context), selector = null
                // If there's a context, create a collection on that context first, and select
                // nodes from there
                else if (context !== undefined) return $(context).find(selector)
                // If it's a CSS selector, use it to select nodes.
                else dom = zepto.qsa(document, selector)
            }
            // If a function is given, call it when the DOM is ready
            else if (isFunction(selector)) return $(document).ready(selector)
            // If a Zepto collection is given, just return it
            else if (zepto.isZ(selector)) return selector
            else {
                // normalize array if an array of nodes is given
                if (isArray(selector)) dom = compact(selector)
                // Wrap DOM nodes.
                else if (isObject(selector))
                    dom = [selector], selector = null
                // If it's a html fragment, create nodes from it
                else if (fragmentRE.test(selector))
                    dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
                // If there's a context, create a collection on that context first, and select
                // nodes from there
                else if (context !== undefined) return $(context).find(selector)
                // And last but no least, if it's a CSS selector, use it to select nodes.
                else dom = zepto.qsa(document, selector)
            }
            // create a new Zepto collection from the nodes found
            return zepto.Z(dom, selector)
        }

        // `$` will be the base `Zepto` object. When calling this
        // function just call `$.zepto.init, which makes the implementation
        // details of selecting nodes and creating Zepto collections
        // patchable in plugins.
        $ = function (selector, context) {
            return zepto.init(selector, context)
        }

        function extend(target, source, deep) {
            for (key in source)
                if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                        target[key] = {}
                    if (isArray(source[key]) && !isArray(target[key]))
                        target[key] = []
                    extend(target[key], source[key], deep)
                }
                else if (source[key] !== undefined) target[key] = source[key]
        }

        // Copy all but undefined properties from one or more
        // objects to the `target` object.
        $.extend = function (target) {
            var deep, args = slice.call(arguments, 1)
            if (typeof target == 'boolean') {
                deep = target
                target = args.shift()
            }
            args.forEach(function (arg) {
                extend(target, arg, deep)
            })
            return target
        }

        // `$.zepto.qsa` is Zepto's CSS selector implementation which
        // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
        // This method can be overridden in plugins.
        zepto.qsa = function (element, selector) {
            var found,
                maybeID = selector[0] == '#',
                maybeClass = !maybeID && selector[0] == '.',
                nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
                isSimple = simpleSelectorRE.test(nameOnly)
            return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
                ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
                (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
                    slice.call(
                        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
                            maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                                element.getElementsByTagName(selector) : // Or a tag
                            element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                    )
        };

        function filtered(nodes, selector) {
            return selector == null ? $(nodes) : $(nodes).filter(selector)
        }

        $.contains = document.documentElement.contains ?
            function (parent, node) {
                return parent !== node && parent.contains(node)
            } :
            function (parent, node) {
                while (node && (node = node.parentNode))
                    if (node === parent) return true;
                return false
            };

        function funcArg(context, arg, idx, payload) {
            return isFunction(arg) ? arg.call(context, idx, payload) : arg
        }

        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
        }

        // access className property while respecting SVGAnimatedString
        function className(node, value) {
            var klass = node.className || '',
                svg = klass && klass.baseVal !== undefined

            if (value === undefined) return svg ? klass.baseVal : klass
            svg ? (klass.baseVal = value) : (node.className = value)
        }

        // "true"  => true
        // "false" => false
        // "null"  => null
        // "42"    => 42
        // "42.5"  => 42.5
        // "08"    => "08"
        // JSON    => parse if valid
        // String  => self
        function deserializeValue(value) {
            try {
                return value ?
                    value == "true" ||
                    ( value == "false" ? false :
                        value == "null" ? null :
                            +value + "" == value ? +value :
                                /^[\[\{]/.test(value) ? $.parseJSON(value) :
                                    value )
                    : value
            } catch (e) {
                return value
            }
        }

        $.type = type
        $.isFunction = isFunction
        $.isWindow = isWindow
        $.isArray = isArray
        $.isPlainObject = isPlainObject

        $.isEmptyObject = function (obj) {
            var name
            for (name in obj) return false
            return true
        }

        $.isNumeric = function (val) {
            var num = Number(val), type = typeof val
            return val != null && type != 'boolean' &&
                (type != 'string' || val.length) && !isNaN(num) && isFinite(num) || false
        }

        $.inArray = function (elem, array, i) {
            return emptyArray.indexOf.call(array, elem, i)
        }

        $.camelCase = camelize
        $.trim = function (str) {
            return str == null ? "" : String.prototype.trim.call(str)
        }

        // plugin compatibility
        $.uuid = 0
        $.support = {}
        $.expr = {}
        $.noop = function () {
        }

        $.map = function (elements, callback) {
            var value, values = [], i, key
            if (likeArray(elements))
                for (i = 0; i < elements.length; i++) {
                    value = callback(elements[i], i)
                    if (value != null) values.push(value)
                }
            else
                for (key in elements) {
                    value = callback(elements[key], key)
                    if (value != null) values.push(value)
                }
            return flatten(values)
        }

        $.each = function (elements, callback) {
            var i, key
            if (likeArray(elements)) {
                for (i = 0; i < elements.length; i++)
                    if (callback.call(elements[i], i, elements[i]) === false) return elements
            } else {
                for (key in elements)
                    if (callback.call(elements[key], key, elements[key]) === false) return elements
            }

            return elements
        }

        $.grep = function (elements, callback) {
            return filter.call(elements, callback)
        }

        if (window.JSON) $.parseJSON = JSON.parse

        // Populate the class2type map
        $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase()
        })

        // Define methods that will be available on all
        // Zepto collections
        $.fn = {
            constructor: zepto.Z,
            length: 0,

            // Because a collection acts like an array
            // copy over these useful array functions.
            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            sort: emptyArray.sort,
            splice: emptyArray.splice,
            indexOf: emptyArray.indexOf,
            concat: function () {
                var i, value, args = []
                for (i = 0; i < arguments.length; i++) {
                    value = arguments[i]
                    args[i] = zepto.isZ(value) ? value.toArray() : value
                }
                return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
            },

            // `map` and `slice` in the jQuery API work differently
            // from their array counterparts
            map: function (fn) {
                return $($.map(this, function (el, i) {
                    return fn.call(el, i, el)
                }))
            },
            slice: function () {
                return $(slice.apply(this, arguments))
            },

            ready: function (callback) {
                // need to check if document.body exists for IE as that browser reports
                // document ready when it hasn't yet created the body element
                if (readyRE.test(document.readyState) && document.body) callback($)
                else document.addEventListener('DOMContentLoaded', function () {
                    callback($)
                }, false)
                return this
            },
            get: function (idx) {
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },
            toArray: function () {
                return this.get()
            },
            size: function () {
                return this.length
            },
            remove: function () {
                return this.each(function () {
                    if (this.parentNode != null)
                        this.parentNode.removeChild(this)
                })
            },
            each: function (callback) {
                emptyArray.every.call(this, function (el, idx) {
                    return callback.call(el, idx, el) !== false
                })
                return this
            },
            filter: function (selector) {
                if (isFunction(selector)) return this.not(this.not(selector))
                return $(filter.call(this, function (element) {
                    return zepto.matches(element, selector)
                }))
            },
            add: function (selector, context) {
                return $(uniq(this.concat($(selector, context))))
            },
            is: function (selector) {
                return this.length > 0 && zepto.matches(this[0], selector)
            },
            not: function (selector) {
                var nodes = []
                if (isFunction(selector) && selector.call !== undefined)
                    this.each(function (idx) {
                        if (!selector.call(this, idx)) nodes.push(this)
                    })
                else {
                    var excludes = typeof selector == 'string' ? this.filter(selector) :
                        (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                    this.forEach(function (el) {
                        if (excludes.indexOf(el) < 0) nodes.push(el)
                    })
                }
                return $(nodes)
            },
            has: function (selector) {
                return this.filter(function () {
                    return isObject(selector) ?
                        $.contains(this, selector) :
                        $(this).find(selector).size()
                })
            },
            eq: function (idx) {
                return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
            },
            first: function () {
                var el = this[0]
                return el && !isObject(el) ? el : $(el)
            },
            last: function () {
                var el = this[this.length - 1]
                return el && !isObject(el) ? el : $(el)
            },
            find: function (selector) {
                var result, $this = this
                if (!selector) result = $()
                else if (typeof selector == 'object')
                    result = $(selector).filter(function () {
                        var node = this
                        return emptyArray.some.call($this, function (parent) {
                            return $.contains(parent, node)
                        })
                    })
                else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
                else result = this.map(function () {
                        return zepto.qsa(this, selector)
                    })
                return result
            },
            closest: function (selector, context) {
                var nodes = [], collection = typeof selector == 'object' && $(selector)
                this.each(function (_, node) {
                    while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                        node = node !== context && !isDocument(node) && node.parentNode
                    if (node && nodes.indexOf(node) < 0) nodes.push(node)
                })
                return $(nodes)
            },
            parents: function (selector) {
                var ancestors = [], nodes = this
                while (nodes.length > 0)
                    nodes = $.map(nodes, function (node) {
                        if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                            ancestors.push(node)
                            return node
                        }
                    })
                return filtered(ancestors, selector)
            },
            parent: function (selector) {
                return filtered(uniq(this.pluck('parentNode')), selector)
            },
            children: function (selector) {
                return filtered(this.map(function () {
                    return children(this)
                }), selector)
            },
            contents: function () {
                return this.map(function () {
                    return this.contentDocument || slice.call(this.childNodes)
                })
            },
            siblings: function (selector) {
                return filtered(this.map(function (i, el) {
                    return filter.call(children(el.parentNode), function (child) {
                        return child !== el
                    })
                }), selector)
            },
            empty: function () {
                return this.each(function () {
                    this.innerHTML = ''
                })
            },
            // `pluck` is borrowed from Prototype.js
            pluck: function (property) {
                return $.map(this, function (el) {
                    return el[property]
                })
            },
            show: function () {
                return this.each(function () {
                    this.style.display == "none" && (this.style.display = '')
                    if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                        this.style.display = defaultDisplay(this.nodeName)
                })
            },
            replaceWith: function (newContent) {
                return this.before(newContent).remove()
            },
            wrap: function (structure) {
                var func = isFunction(structure)
                if (this[0] && !func)
                    var dom = $(structure).get(0),
                        clone = dom.parentNode || this.length > 1

                return this.each(function (index) {
                    $(this).wrapAll(
                        func ? structure.call(this, index) :
                            clone ? dom.cloneNode(true) : dom
                    )
                })
            },
            wrapAll: function (structure) {
                if (this[0]) {
                    $(this[0]).before(structure = $(structure))
                    var children
                    // drill down to the inmost element
                    while ((children = structure.children()).length) structure = children.first()
                    $(structure).append(this)
                }
                return this
            },
            wrapInner: function (structure) {
                var func = isFunction(structure)
                return this.each(function (index) {
                    var self = $(this), contents = self.contents(),
                        dom = func ? structure.call(this, index) : structure
                    contents.length ? contents.wrapAll(dom) : self.append(dom)
                })
            },
            unwrap: function () {
                this.parent().each(function () {
                    $(this).replaceWith($(this).children())
                })
                return this
            },
            clone: function () {
                return this.map(function () {
                    return this.cloneNode(true)
                })
            },
            hide: function () {
                return this.css("display", "none")
            },
            toggle: function (setting) {
                return this.each(function () {
                    var el = $(this)
                        ;
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
                })
            },
            prev: function (selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*')
            },
            next: function (selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*')
            },
            html: function (html) {
                return 0 in arguments ?
                    this.each(function (idx) {
                        var originHtml = this.innerHTML
                        $(this).empty().append(funcArg(this, html, idx, originHtml))
                    }) :
                    (0 in this ? this[0].innerHTML : null)
            },
            text: function (text) {
                return 0 in arguments ?
                    this.each(function (idx) {
                        var newText = funcArg(this, text, idx, this.textContent)
                        this.textContent = newText == null ? '' : '' + newText
                    }) :
                    (0 in this ? this.pluck('textContent').join("") : null)
            },
            attr: function (name, value) {
                var result
                return (typeof name == 'string' && !(1 in arguments)) ?
                    (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
                    this.each(function (idx) {
                        if (this.nodeType !== 1) return
                        if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
                        else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                    })
            },
            removeAttr: function (name) {
                return this.each(function () {
                    this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                        setAttribute(this, attribute)
                    }, this)
                })
            },
            prop: function (name, value) {
                name = propMap[name] || name
                return (1 in arguments) ?
                    this.each(function (idx) {
                        this[name] = funcArg(this, value, idx, this[name])
                    }) :
                    (this[0] && this[0][name])
            },
            removeProp: function (name) {
                name = propMap[name] || name
                return this.each(function () {
                    delete this[name]
                })
            },
            data: function (name, value) {
                var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

                var data = (1 in arguments) ?
                    this.attr(attrName, value) :
                    this.attr(attrName)

                return data !== null ? deserializeValue(data) : undefined
            },
            val: function (value) {
                if (0 in arguments) {
                    if (value == null) value = ""
                    return this.each(function (idx) {
                        this.value = funcArg(this, value, idx, this.value)
                    })
                } else {
                    return this[0] && (this[0].multiple ?
                            $(this[0]).find('option').filter(function () {
                                return this.selected
                            }).pluck('value') :
                            this[0].value)
                }
            },
            offset: function (coordinates) {
                if (coordinates) return this.each(function (index) {
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top: coords.top - parentOffset.top,
                            left: coords.left - parentOffset.left
                        }

                    if ($this.css('position') == 'static') props['position'] = 'relative'
                    $this.css(props)
                })
                if (!this.length) return null
                if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
                    return {top: 0, left: 0}
                var obj = this[0].getBoundingClientRect()
                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    width: Math.round(obj.width),
                    height: Math.round(obj.height)
                }
            },
            css: function (property, value) {
                if (arguments.length < 2) {
                    var element = this[0]
                    if (typeof property == 'string') {
                        if (!element) return
                        return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
                    } else if (isArray(property)) {
                        if (!element) return
                        var props = {}
                        var computedStyle = getComputedStyle(element, '')
                        $.each(property, function (_, prop) {
                            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                        })
                        return props
                    }
                }

                var css = ''
                if (type(property) == 'string') {
                    if (!value && value !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(property))
                        })
                    else
                        css = dasherize(property) + ":" + maybeAddPx(property, value)
                } else {
                    for (key in property)
                        if (!property[key] && property[key] !== 0)
                            this.each(function () {
                                this.style.removeProperty(dasherize(key))
                            })
                        else
                            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                }

                return this.each(function () {
                    this.style.cssText += ';' + css
                })
            },
            index: function (element) {
                return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
            },
            hasClass: function (name) {
                if (!name) return false
                return emptyArray.some.call(this, function (el) {
                    return this.test(className(el))
                }, classRE(name))
            },
            addClass: function (name) {
                if (!name) return this
                return this.each(function (idx) {
                    if (!('className' in this)) return
                    classList = []
                    var cls = className(this), newName = funcArg(this, name, idx, cls)
                    newName.split(/\s+/g).forEach(function (klass) {
                        if (!$(this).hasClass(klass)) classList.push(klass)
                    }, this)
                    classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
                })
            },
            removeClass: function (name) {
                return this.each(function (idx) {
                    if (!('className' in this)) return
                    if (name === undefined) return className(this, '')
                    classList = className(this)
                    funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                        classList = classList.replace(classRE(klass), " ")
                    })
                    className(this, classList.trim())
                })
            },
            toggleClass: function (name, when) {
                if (!name) return this
                return this.each(function (idx) {
                    var $this = $(this), names = funcArg(this, name, idx, className(this))
                    names.split(/\s+/g).forEach(function (klass) {
                        (when === undefined ? !$this.hasClass(klass) : when) ?
                            $this.addClass(klass) : $this.removeClass(klass)
                    })
                })
            },
            scrollTop: function (value) {
                if (!this.length) return
                var hasScrollTop = 'scrollTop' in this[0]
                if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
                return this.each(hasScrollTop ?
                    function () {
                        this.scrollTop = value
                    } :
                    function () {
                        this.scrollTo(this.scrollX, value)
                    })
            },
            scrollLeft: function (value) {
                if (!this.length) return
                var hasScrollLeft = 'scrollLeft' in this[0]
                if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
                return this.each(hasScrollLeft ?
                    function () {
                        this.scrollLeft = value
                    } :
                    function () {
                        this.scrollTo(value, this.scrollY)
                    })
            },
            position: function () {
                if (!this.length) return

                var elem = this[0],
                    // Get *real* offsetParent
                    offsetParent = this.offsetParent(),
                    // Get correct offsets
                    offset = this.offset(),
                    parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset()

                // Subtract element margins
                // note: when an element has margin: auto the offsetLeft and marginLeft
                // are the same in Safari causing offset.left to incorrectly be 0
                offset.top -= parseFloat($(elem).css('margin-top')) || 0
                offset.left -= parseFloat($(elem).css('margin-left')) || 0

                // Add offsetParent borders
                parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
                parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

                // Subtract the two offsets
                return {
                    top: offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                }
            },
            offsetParent: function () {
                return this.map(function () {
                    var parent = this.offsetParent || document.body
                    while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                        parent = parent.offsetParent
                    return parent
                })
            }
        };

        // for now
        $.fn.detach = $.fn.remove

        // Generate the `width` and `height` functions
        ;
        ['width', 'height'].forEach(function (dimension) {
            var dimensionProperty =
                dimension.replace(/./, function (m) {
                    return m[0].toUpperCase()
                })

            $.fn[dimension] = function (value) {
                var offset, el = this[0]
                if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
                    isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
                        (offset = this.offset()) && offset[dimension]
                else return this.each(function (idx) {
                    el = $(this)
                    el.css(dimension, funcArg(this, value, idx, el[dimension]()))
                })
            }
        })

        function traverseNode(node, fun) {
            fun(node)
            for (var i = 0, len = node.childNodes.length; i < len; i++)
                traverseNode(node.childNodes[i], fun)
        }

        // Generate the `after`, `prepend`, `before`, `append`,
        // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
        adjacencyOperators.forEach(function (operator, operatorIndex) {
            var inside = operatorIndex % 2 //=> prepend, append

            $.fn[operator] = function () {
                // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
                var argType, nodes = $.map(arguments, function (arg) {
                        var arr = []
                        argType = type(arg)
                        if (argType == "array") {
                            arg.forEach(function (el) {
                                if (el.nodeType !== undefined) return arr.push(el)
                                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                                arr = arr.concat(zepto.fragment(el))
                            })
                            return arr
                        }
                        return argType == "object" || arg == null ?
                            arg : zepto.fragment(arg)
                    }),
                    parent, copyByClone = this.length > 1
                if (nodes.length < 1) return this

                return this.each(function (_, target) {
                    parent = inside ? target : target.parentNode

                    // convert all methods to a "before" operation
                    target = operatorIndex == 0 ? target.nextSibling :
                        operatorIndex == 1 ? target.firstChild :
                            operatorIndex == 2 ? target :
                                null

                    var parentInDocument = $.contains(document.documentElement, parent)

                    nodes.forEach(function (node) {
                        if (copyByClone) node = node.cloneNode(true)
                        else if (!parent) return $(node).remove()

                        parent.insertBefore(node, target)
                        if (parentInDocument) traverseNode(node, function (el) {
                            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                                (!el.type || el.type === 'text/javascript') && !el.src) {
                                var target = el.ownerDocument ? el.ownerDocument.defaultView : window
                                target['eval'].call(target, el.innerHTML)
                            }
                        })
                    })
                })
            }

            // after    => insertAfter
            // prepend  => prependTo
            // before   => insertBefore
            // append   => appendTo
            $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
                $(html)[operator](this)
                return this
            }
        })

        zepto.Z.prototype = Z.prototype = $.fn

        // Export internal API functions in the `$.zepto` namespace
        zepto.uniq = uniq
        zepto.deserializeValue = deserializeValue
        $.zepto = zepto

        return $
    })();

    window.Zepto = Zepto;
    window.$ === undefined && (window.$ = Zepto);

    //event事件(事件处理)
    (function ($) {
        var _zid = 1, undefined,
            slice = Array.prototype.slice,
            isFunction = $.isFunction,
            isString = function (obj) {
                return typeof obj == 'string'
            },
            handlers = {},//_zid: events    事件缓存池
            specialEvents = {},
            //是否支持即将获取焦点时触发函数 onfocusin 事件类似于 onfocus 事件。 主要的区别是 onfocus 事件不支持冒泡。
            focusinSupported = 'onfocusin' in window,
            focus = {focus: 'focusin', blur: 'focusout'},
            //mouseenter、mouseleave不冒泡
            hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'};

        //此处标准浏览器，click、mousedown、mouseup、mousemove抛出的就是MouseEvents，应该也是对低版本IE等某些浏览器的修正
        specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

        //取元素标识符，没有设置一个返回
        function zid(element) {
            return element._zid || (element._zid = _zid++)
        }

        //根据形参条件 查找元素上事件响应函数集合
        function findHandlers(element, event, fn, selector) {
            event = parse(event);
            if (event.ns) var matcher = matcherFor(event.ns);
            /**
             * 若有event.e ,则判断事件类型是否相同，否则直接走下一步
             * 若有event.e,则判断事件命名空间是否相同 RegExp.prototype.test = function(String) {};
             * zid(handler.fn)返回handler.fn的标识，没有加一个，判断fn标识符是否相同
             * 若有selector 则判断selector是否相同
             * */
            return (handlers[zid(element)] || []).filter(function (handler) {
                return handler
                    && (!event.e || handler.e == event.e)
                    && (!event.ns || matcher.test(handler.ns))
                    && (!fn || zid(handler.fn) === zid(fn))
                    && (!selector || handler.sel == selector)
            })
        }

        /**
         * 解析事件类型 parse("click.zhutao.xiaoyu"); => Object {e: "click", ns: "xiaoyu zhutao"}
         * slice取从索引为1之后的所有项，sort对数组进行排序，join(" ")将数组变为字符串，中间插入空格
         * */
        function parse(event) {
            var parts = ('' + event).split('.');
            return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
        }

        //生成命名空间的正则对象 matcherFor("xiaoyu zhutao"); => /(?:^| )xiaoyu.* ?zhutao(?: |$)/
        function matcherFor(ns) {
            return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
        }

        //addEventListener 的第三个参数，true - 事件句柄在捕获阶段执行，false - 默认,事件句柄在冒泡阶段执行
        function eventCapture(handler, captureSetting) {
            return handler.del &&
                (!focusinSupported && (handler.e in focus)) || !!captureSetting
        }

        //修正事件类型 focus->focusIn blur->focusOut mouseenter->mouseover  mouseleave->mouseout
        function realEvent(type) {
            return hover[type] || (focusinSupported && focus[type]) || type
        }

        //增加事件底层方法; add(element, event, callback, data, selector, delegator || autoRemove)
        function add(element, events, fn, data, selector, delegator, capture) {
            var id = zid(element), set = (handlers[id] || (handlers[id] = []));
            events.split(/\s/).forEach(function (event) {
                if (event == 'ready') return $(document).ready(fn);
                var handler = parse(event);
                handler.fn = fn;
                handler.sel = selector;
                //如果事件是mouseenter, mouseleave，模拟mouseover mouseout事件处理
                if (handler.e in hover) fn = function (e) {
                    /**
                     * relatedTarget 事件属性返回与事件的目标节点相关的节点。
                     * 对于 mouseover 事件来说，该属性是鼠标指针移到目标节点上时所离开的那个节点。
                     * 对于 mouseout 事件来说，该属性是离开目标时，鼠标指针进入的节点。
                     * 对于其他类型的事件来说，这个属性没有用。
                     * */
                    var related = e.relatedTarget;
                    //当related不在事件对象event内   表示事件已触发完成，不是在move过程中，需要执行响应函数
                    if (!related || (related !== this && !$.contains(this, related)))
                        return handler.fn.apply(this, arguments)
                };
                handler.del = delegator;
                var callback = delegator || fn;
                handler.proxy = function (e) {
                    e = compatible(e);
                    //如果某个监听函数执行了event.stopImmediatePropagation()方法,则除了该事件的冒泡行为被阻止之外(event.stopPropagation方法的作用),该元素绑定的后序事件的监听函数的执行也将被阻止.
                    if (e.isImmediatePropagationStopped()) return;
                    e.data = data;
                    //执行回调函数，context：element，arguments：event,e._args(默认是undefind，trigger()时传递的参数）
                    var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
                    //当事件响应函数返回false时，阻止浏览器默认操作和冒泡
                    if (result === false) e.preventDefault(), e.stopPropagation();
                    return result
                };
                //设置事件响应函数的索引,删除事件时，根据它来删除  delete handlers[id][handler.i]
                handler.i = set.length;
                set.push(handler);
                if ('addEventListener' in element)
                    element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            })
        }

        //删除事件,对应add
        function remove(element, events, fn, selector, capture) {
            var id = zid(element);
            (events || '').split(/\s/).forEach(function (event) {
                findHandlers(element, event, fn, selector).forEach(function (handler) {
                    // delete删除掉数组中的元素后，会把该下标出的值置为undefined,数组的长度不会变
                    delete handlers[id][handler.i]
                    if ('removeEventListener' in element)
                        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
                })
            })
        }

        //此处不清楚要干嘛，将事件两个核心底层方法封装到event对象里，方便做Zepto插件事件扩展吧
        $.event = {add: add, remove: remove};

        //接受一个函数，然后返回一个新函数，并且这个新函数始终保持了特定的上下文(context)语境，新函数中this指向context参数
        $.proxy = function (fn, context) {
            //如果传了第3个参数，取到第3个参数以后（包含第3个参数）所有的参数数组
            var args = (2 in arguments) && slice.call(arguments, 2);
            if (isFunction(fn)) {
                //args.concat(slice.call(arguments))将代理函数的参数与$.proxy的第三个及后面可选参数合并
                var proxyFn = function () {
                    return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments)
                };
                //标记函数
                proxyFn._zid = zid(fn);
                return proxyFn
            } else if (isString(context)) { //另外一种形式，原始的function是从上下文(context)对象的特定属性读取
                if (args) {
                    args.unshift(fn[context], fn);
                    return $.proxy.apply(null, args)
                } else {
                    return $.proxy(fn[context], fn)
                }
            } else {
                throw new TypeError("expected function")
            }
        };

        $.fn.bind = function (event, data, callback) {
            return this.on(event, data, callback)
        };
        $.fn.unbind = function (event, callback) {
            return this.off(event, callback)
        };
        //添加一个处理事件到元素，当第一次执行事件以后，该事件将自动解除绑定，保证处理函数在每个元素上最多执行一次。
        $.fn.one = function (event, selector, data, callback) {
            return this.on(event, selector, data, callback, 1)
        };

        var returnTrue = function () {
                return true
            },
            returnFalse = function () {
                return false
            },
            ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
            eventMethods = {
                preventDefault: 'isDefaultPrevented',
                stopImmediatePropagation: 'isImmediatePropagationStopped',
                stopPropagation: 'isPropagationStopped'
            };

        /**
         * 修正event对象
         * @param event   代理的event对象|原生event对象
         * @param source  原生event对象
         * @returns {*}
         */
        function compatible(event, source) {
            if (source || !event.isDefaultPrevented) {
                source || (source = event);
                /**
                 * 遍历，给事件添加isDefaultPrevented、isImmediatePropagationStopped、isPropagationStopped方法
                 * isDefaultPrevented:如果preventDefault()被该事件的实例调用，那么返回true。这可作为跨平台的替代原生的defaultPrevented属性，如果defaultPrevented缺失或在某些浏览器下不可靠的时候。
                 * isImmediatePropagationStopped:如果stopImmediatePropagation()被该事件的实例调用，那么返回true。Zepto在不支持该原生方法的浏览器中实现它，（例如老版本的Android）。
                 * isPropagationStopped:如果stopPropagation()被该事件的实例调用，那么返回true。
                 **/
                $.each(eventMethods, function (name, predicate) {
                    var sourceMethod = source[name];
                    event[name] = function () {
                        this[predicate] = returnTrue;
                        return sourceMethod && sourceMethod.apply(source, arguments)
                    };
                    event[predicate] = returnFalse
                });

                event.timeStamp || (event.timeStamp = Date.now());
                //如果浏览器支持defaultPrevented DOM3 EVENT提出的能否取消默认行为
                //source.defaultPrevented:判断默认事件是否已被阻止,与preventDefault()相对应,这是对各种情况的兼容
                if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                        'returnValue' in source ? source.returnValue === false :
                            source.getPreventDefault && source.getPreventDefault())
                    event.isDefaultPrevented = returnTrue
            }
            //返回修正对象
            return event
        }

        //新建一个对象 封装event，创建代理对象
        function createProxy(event) {
            var key, proxy = {originalEvent: event};
            //复制event属性至proxy，ignoreProperties里包含的属性除外
            for (key in event)
                if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

            return compatible(proxy, event)
        }

        $.fn.delegate = function (selector, event, callback) {
            return this.on(event, selector, callback)
        };
        $.fn.undelegate = function (selector, event, callback) {
            return this.off(event, selector, callback)
        };

        //冒泡到document.body绑定事件
        $.fn.live = function (event, callback) {
            $(document.body).delegate(this.selector, event, callback);
            return this
        };
        //在doument.body解绑事件
        $.fn.die = function (event, callback) {
            $(document.body).undelegate(this.selector, event, callback);
            return this
        };

        /**
         * 多个事件可以通过空格的字符串方式添加，或者以事件类型为键、以函数为值的对象方式。
         * 如果给定css选择器，当事件在匹配该选择器的元素上发起时，事件才会被触发
         * 如果给定data参数，这个值将在事件处理程序执行期间被作为有用的 event.data 属性
         * */
        $.fn.on = function (event, selector, data, callback, one) {
            var autoRemove, delegator, $this = this;
            //event是对象{ type: handler, type2: handler2, ... }
            if (event && !isString(event)) {
                $.each(event, function (type, fn) {
                    $this.on(type, selector, data, fn, one)
                });
                return $this
            }

            //校验调整函数参数
            if (!isString(selector) && !isFunction(callback) && callback !== false)
                callback = data, data = selector, selector = undefined;
            if (callback === undefined || data === false)
                callback = data, data = undefined;

            //如果false在回调函数的位置上作为参数传递给这个方法，它相当于传递一个函数，这个函数直接返回false。
            if (callback === false) callback = returnFalse;

            return $this.each(function (_, element) {
                if (one) autoRemove = function (e) {
                    remove(element, e.type, callback);
                    return callback.apply(this, arguments)
                };

                if (selector) delegator = function (e) {
                    //closest 从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素。如果给定context节点参数，那么只匹配该节点的后代元素。
                    var evt, match = $(e.target).closest(selector, element).get(0);
                    //其实还是在父元素上进行监听，只不过如果事件触发的元素不是匹配的话，不调用函数回调
                    if (match && match !== element) {
                        evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element});
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                    }
                };

                add(element, event, callback, data, selector, delegator || autoRemove)
            })
        };
        $.fn.off = function (event, selector, callback) {
            var $this = this;
            if (event && !isString(event)) {
                $.each(event, function (type, fn) {
                    $this.off(type, selector, fn)
                });
                return $this
            }

            if (!isString(selector) && !isFunction(callback) && callback !== false)
                callback = selector, selector = undefined;

            if (callback === false) callback = returnFalse;

            return $this.each(function () {
                remove(this, event, callback, selector)
            })
        };

        //在对象集合的元素上触发指定的事件。事件可以是一个字符串类型，也可以是一个 通过$.Event 定义的事件对象。如果给定args参数，它会作为参数传递给事件函数。
        $.fn.trigger = function (event, args) {
            event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event);
            event._args = args;
            return this.each(function () {
                // handle focus(), blur() by calling them directly
                if (event.type in focus && typeof this[event.type] == "function") this[event.type]();
                // items in the collection might not be DOM elements
                else if ('dispatchEvent' in this) this.dispatchEvent(event);
                //可能不是dom元素上触发指定事件
                else $(this).triggerHandler(event, args)
            })
        };

        // triggers event handlers on current element just as if an event occurred,
        // doesn't trigger an actual event, doesn't bubble
        $.fn.triggerHandler = function (event, args) {
            var e, result;
            this.each(function (i, element) {
                e = createProxy(isString(event) ? $.Event(event) : event);
                e._args = args;
                e.target = element;
                //找到此元素上此事件类型上的事件响应函数集，遍历，触发
                $.each(findHandlers(element, event.type || event), function (i, handler) {
                    //调用 handler.proxy执行事件
                    result = handler.proxy(e);
                    //如果event调用了immediatePropagationStopped()，终止后续事件的响应
                    if (e.isImmediatePropagationStopped()) return false
                })
            });
            return result
        };

        //给常用事件生成便捷方法
        ('focusin focusout focus blur load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select keydown keypress keyup error').split(' ').forEach(function (event) {
            //有callback回调，是绑定事件，否则，触发事件
            $.fn[event] = function (callback) {
                return (0 in arguments) ?
                    this.bind(event, callback) :
                    this.trigger(event)
            }
        });

        //创建Event对象
        $.Event = function (type, props) {
            //当type是个对象时 保证type为对象的属性字符串，props为对象
            if (!isString(type)) props = type, type = props.type;
            //创建自定义事件，如果是click,mousedown,mouseup mousemove创建为MouseEvent对象,bubbles设为冒泡
            var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true;
            //bubbles = !!props[name]冒泡判断；event[name] = props[name] props属性扩展到event对象上
            if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
            //初始化event对象，type为事件名称，如click，bubbles为是否冒泡，第三个参数表示是否可以用preventDefault方法来取消默认操作
            event.initEvent(type, bubbles, true);
            return compatible(event)
        };
    })(Zepto);

    //fx The animate()方法
    (function ($, undefined) {
        //prefix:样式前缀(-webkit-、-moz-、-o-)；eventPrefix事件前缀(webkit、''、o)
        var prefix = '', eventPrefix,
            //内核厂商
            vendors = {Webkit: 'webkit', Moz: '', O: 'o'},
            testEl = document.createElement('div'),
            //支持的过渡、动画效果
            supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
            transform,
            //过渡
            transitionProperty, transitionDuration, transitionTiming, transitionDelay,
            //动画
            animationName, animationDuration, animationTiming, animationDelay,
            cssReset = {};

        //将字符串转成css属性，如aB-->a-b
        function dasherize(str) {
            return str.replace(/([A-Z])/g, '-$1').toLowerCase()
        }

        //修正事件名(如果不支持css3标准语法，则为事件添加前缀)
        function normalizeEvent(name) {
            return eventPrefix ? eventPrefix + name : name.toLowerCase()
        }

        //如果不支持css3标准，那么为样式加上内核厂商前缀
        if (testEl.style.transform === undefined) $.each(vendors, function (vendor, event) {
            if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
                prefix = '-' + vendor.toLowerCase() + '-';
                eventPrefix = event;
                return false
            }
        });

        //将transform设置为兼容性写法
        transform = prefix + 'transform';
        cssReset[transitionProperty = prefix + 'transition-property'] =
            cssReset[transitionDuration = prefix + 'transition-duration'] =
                cssReset[transitionDelay = prefix + 'transition-delay'] =
                    cssReset[transitionTiming = prefix + 'transition-timing-function'] =
                        cssReset[animationName = prefix + 'animation-name'] =
                            cssReset[animationDuration = prefix + 'animation-duration'] =
                                cssReset[animationDelay = prefix + 'animation-delay'] =
                                    cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

        $.fx = {
            //判断是否支持css3的过渡及动画，如果即不支持css3的标准语法同时不支持带前缀的兼容形式，那么判断为不支持
            off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
            speeds: {_default: 400, fast: 200, slow: 600},
            cssPrefix: prefix,
            transitionEnd: normalizeEvent('TransitionEnd'),
            animationEnd: normalizeEvent('AnimationEnd')
        };

        /**
         * 自定义动画
         * properties:属性对象
         * duration:过渡的时间，_default/fast/slow/数字
         * ease:变化的速率曲线，ease、linear、ease-in / ease-out、ease-in-out
         * callback:回调函数
         * delay:延迟时间
         * 并不是完全意义上的校验函数参数
         * 只有'function(properties,callback)'、'function(properties,duration,callback))'、'function(properties,duration,easing,callback,delay))'
         * 'function(properties,{duration: msec, easing: type, complete: fn }'、'function(animationName, {}'几种格式
         *
         * */
        $.fn.animate = function (properties, duration, ease, callback, delay) {
            // 传参为function(properties,callback)
            if ($.isFunction(duration))
                callback = duration, ease = undefined, duration = undefined;
            // 传参为function(properties,duration，callback)
            if ($.isFunction(ease))
                callback = ease, ease = undefined;
            //传参为function(properties, {})
            if ($.isPlainObject(duration))
                ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration;
            if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000;
            if (delay) delay = parseFloat(delay) / 1000;
            return this.anim(properties, duration, ease, callback, delay)
        };

        $.fn.anim = function (properties, duration, ease, callback, delay) {
            var key, cssValues = {}, cssProperties, transforms = '',
                that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
                fired = false;

            //修正好时间
            if (duration === undefined) duration = $.fx.speeds._default / 1000;
            //修正好延迟
            if (delay === undefined) delay = 0;
            //如果浏览器不支持动画，持续时间设为0，直接跳动画结束
            if ($.fx.off) duration = 0;
            //css3动画:keyframe animation
            if (typeof properties == 'string') {
                cssValues[animationName] = properties;
                cssValues[animationDuration] = duration + 's';
                cssValues[animationDelay] = delay + 's';
                cssValues[animationTiming] = (ease || 'linear');
                endEvent = $.fx.animationEnd;
            } else {
                cssProperties = [];
                // CSS3的过渡
                for (key in properties)
                    //用于传参时{"rotateX": "120deg"}这种形式的properties，正常情况下是"transform": "rotateX(120deg)"
                    if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') ';
                    else cssValues[key] = properties[key], cssProperties.push(dasherize(key));
                if (transforms) cssValues[transform] = transforms, cssProperties.push(transform);
                if (duration > 0 && typeof properties === 'object') {
                    cssValues[transitionProperty] = cssProperties.join(', ');
                    cssValues[transitionDuration] = duration + 's';
                    cssValues[transitionDelay] = delay + 's';
                    cssValues[transitionTiming] = (ease || 'linear')
                }
            }
            //动画完成后的响应函数
            wrappedCallback = function (event) {
                event = undefined;
                //动画完成后移除监听函数
                if (typeof event !== 'undefined') {
                    //如果监听函数不是设置在事件发生元素上，而是元素的祖先元素，通过向上冒泡触发的，那么不能移除
                    if (event.target !== event.currentTarget) return; // makes sure the event didn't bubble from "below"
                    $(event.target).unbind(endEvent, wrappedCallback)
                } else
                    $(this).unbind(endEvent, wrappedCallback); // triggered by setTimeout

                fired = true;
                //动画完成后，将过渡和动画样式重置为空
                $(this).css(cssReset);
                callback && callback.call(this);
            };
            //处理动画结束事件
            if (duration > 0) {
                this.bind(endEvent, wrappedCallback);
                // transitionEnd is not always firing on older Android phones
                // so make sure it gets fired
                //延时ms后执行动画，注意这里加了25ms，保持endEvent，动画先执行完。
                //旧的android手机不一定总是会调用transitionEnd回调函数，所以在动画执行完后进行判断，如果没有执行则自己手动调用
                setTimeout(function () {
                    if (fired) return;
                    wrappedCallback.call(that)
                }, ((duration + delay) * 1000) + 25)
            }
            /**
             * 主动触发页面回流，刷新DOM，让接下来设置的动画可以正确播放
             * 更改 offsetTop、offsetLeft、offsetWidth、offsetHeight；
             * scrollTop、scrollLeft、scrollWidth、scrollHeight；
             * clientTop、clientLeft、clientWidth、clientHeight；
             * getComputedStyle()、currentStyle()，这些都会触发回流。
             * 回流导致DOM重新渲染，平时要尽可能避免。
             * 但这里，为了动画即时生效播放，则主动触发回流，刷新DOM
             * */
            this.size() && this.get(0).clientLeft
            //设置样式，启动动画
            this.css(cssValues);
            //duration为0，即浏览器不支持动画的情况，直接执行动画结束，执行回调。
            if (duration <= 0) setTimeout(function () {
                that.each(function () {
                    wrappedCallback.call(this)
                })
            }, 0);
            return this
        };

        testEl = null;
    })(Zepto);

    //fx_methods 以动画形式的show,hide,toggle,和fade等方法.
    (function ($, undefined) {
        var document = window.document, docElem = document.documentElement,
            origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle;

        //底层方法，调用$.fn.animate方法
        function anim(el, speed, opacity, scale, callback) {
            if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
            var props = {opacity: opacity};
            if (scale) {
                props.scale = scale;
                //设置元素变换的基点，默认为(50% 50% 0)，第三个参数为可选，当为3D变化时，可传第三个参数
                el.css($.fx.cssPrefix + 'transform-origin', '0 0')
            }
            return el.animate(props, speed, null, callback)
        }

        //底层方法：隐藏显示的元素
        function hide(el, speed, scale, callback) {
            return anim(el, speed, 0, scale, function () {
                //调用原先的方法，即设置元素的display属性为none($.fn.hide)
                origHide.call($(this));
                callback && callback.call(this)
            })
        }

        //首先调用原先的$.fn.show方法将元素display属性设置为block，然后设置opacity属性为0，再进行过渡opacity为1，宽高设置为原先的
        $.fn.show = function (speed, callback) {
            origShow.call(this);
            if (speed === undefined) speed = 0;
            else this.css('opacity', 0);
            return anim(this, speed, 1, '1,1', callback)
        };

        //隐藏元素效果(通过设置opacity为0隐藏元素，同时设置scale有切换效果，设置切换原点为0、0，宽高为0)
        $.fn.hide = function (speed, callback) {
            //如果speed参数为undefined，即过渡时间为undefined，那么直接调用核心方法里面的隐藏元素方法
            if (speed === undefined) return origHide.call(this);
            else return hide(this, speed, '0,0', callback)
        };

        //如果speed不符合要求，那么直接调用原先的$.fn.toggle方法，否则进行进行判断当前显示状态并切换
        $.fn.toggle = function (speed, callback) {
            if (speed === undefined || typeof speed == 'boolean')
                return origToggle.call(this, speed);
            else return this.each(function () {
                var el = $(this);
                el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
            })
        };

        //淡入淡出总函数，相比而言去掉了scale变化
        $.fn.fadeTo = function (speed, opacity, callback) {
            return anim(this, speed, opacity, null, callback)
        };

        //淡入(如果之前的opacity大于0，那么记录下来，然后设置opacity为0，然后过渡到记录值；如果opacity<=0，那么直接过渡到1)
        $.fn.fadeIn = function (speed, callback) {
            var target = this.css('opacity');
            if (target > 0) this.css('opacity', 0);
            else target = 1;
            return origShow.call(this).fadeTo(speed, target, callback)
        };

        //淡出
        $.fn.fadeOut = function (speed, callback) {
            return hide(this, speed, null, callback)
        };

        //淡入淡出切换
        $.fn.fadeToggle = function (speed, callback) {
            return this.each(function () {
                var el = $(this);
                el[
                    (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
                    ](speed, callback)
            })
        }
    })(Zepto);

    //touch事件 在触摸设备上触发tap–和swipe–相关事件。这适用于所有的`touch`(iOS, Android)和`pointer`事件(Windows Phone)。
    (function ($) {
        var touch = {},
            touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
            longTapDelay = 750,
            gesture;

        //判断滑动方向，返回Left, Right, Up, Down
        function swipeDirection(x1, x2, y1, y2) {
            return Math.abs(x1 - x2) >=
            Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
        }

        //
        function longTap() {
            longTapTimeout = null;
            if (touch.last) {
                touch.el.trigger('longTap');
                touch = {}
            }
        }

        //
        function cancelLongTap() {
            if (longTapTimeout) clearTimeout(longTapTimeout);
            longTapTimeout = null
        }

        //
        function cancelAll() {
            console.error('cancelAll');
            if (touchTimeout) clearTimeout(touchTimeout);
            if (tapTimeout) clearTimeout(tapTimeout);
            if (swipeTimeout) clearTimeout(swipeTimeout);
            if (longTapTimeout) clearTimeout(longTapTimeout);
            touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
            touch = {}
        }

        //判断是否是点击指针是否为主指针(http://www.ayqy.net/blog/html5%E8%A7%A6%E6%91%B8%E4%BA%8B%E4%BB%B6/)
        function isPrimaryTouch(event) {
            return (event.pointerType == 'touch' ||
                event.pointerType == event.MSPOINTER_TYPE_TOUCH)
                && event.isPrimary
        }

        //判断是否为鼠标事件
        function isPointerEventType(e, type) {
            return (e.type == 'pointer' + type ||
            e.type.toLowerCase() == 'mspointer' + type)
        }

        $(document).ready(function () {
            var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType;

            //IE的手势
            if ('MSGesture' in window) {
                gesture = new MSGesture();
                gesture.target = document.body
            }

            $(document)
                .bind('MSGestureEnd', function (e) { //处理IE手势结束
                    var swipeDirectionFromVelocity =
                        e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
                    if (swipeDirectionFromVelocity) {
                        touch.el.trigger('swipe');
                        touch.el.trigger('swipe' + swipeDirectionFromVelocity)
                    }
                })
                //处理手指接触和鼠标事件
                .on('touchstart MSPointerDown pointerdown', function (e) {
                    console.log('start', isPointerEventType(e, 'down'), isPrimaryTouch(e), isPointerEventType(e, 'down') && !isPrimaryTouch(e));
                    //屏蔽掉非触摸设备(非触屏设备鼠标事件isPrimary属性为true)
                    if ((_isPointerType = isPointerEventType(e, 'down')) && !isPrimaryTouch(e)) return;
                    firstTouch = _isPointerType ? e : e.touches[0];
                    if (e.touches && e.touches.length === 1 && touch.x2) {
                        // Clear out touch movement data if we have it sticking around
                        // This can occur if touchcancel doesn't fire due to preventDefault, etc.
                        touch.x2 = undefined;
                        touch.y2 = undefined
                    }
                    //当前时间毫秒数
                    now = Date.now();
                    //距离上次碰触的时间差
                    delta = now - (touch.last || now);
                    //点击元素
                    touch.el = $('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);
                    touchTimeout && clearTimeout(touchTimeout);
                    //记录点击起点坐标
                    touch.x1 = firstTouch.pageX;
                    touch.y1 = firstTouch.pageY;
                    //判断是否双击
                    if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
                    touch.last = now;
                    longTapTimeout = setTimeout(longTap, longTapDelay);
                    //支持IE手势识别
                    if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
                    console.log('start', touch);
                })
                .on('touchmove MSPointerMove pointermove', function (e) {
                    if ((_isPointerType = isPointerEventType(e, 'move')) && !isPrimaryTouch(e)) return;
                    firstTouch = _isPointerType ? e : e.touches[0];
                    //取消长按事件处理器(touchstart设置的)
                    cancelLongTap();
                    //设置touch对象的位置
                    touch.x2 = firstTouch.pageX;
                    touch.y2 = firstTouch.pageY;
                    deltaX += Math.abs(touch.x1 - touch.x2);
                    deltaY += Math.abs(touch.y1 - touch.y2);
                    console.log('move', touch, touch.x1, touch.y1, touch.x2, touch.y2, 'deltaX', deltaX, 'deltaY', deltaY);
                })
                .on('touchend MSPointerUp pointerup', function (e) {
                    console.error('end');
                    if ((_isPointerType = isPointerEventType(e, 'up')) && !isPrimaryTouch(e)) return;
                    //取消长按事件处理器(touchstart设置的)
                    cancelLongTap();
                    // swipe
                    if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                        (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

                        swipeTimeout = setTimeout(function () {
                            if (touch.el) {
                                touch.el.trigger('swipe');
                                touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
                            }
                            touch = {}
                        }, 0);

                    // normal tap
                    else if ('last' in touch)
                    // don't fire tap when delta position changed by more than 30 pixels,
                    // for instance when moving to a point and back to origin
                        if (deltaX < 30 && deltaY < 30) {
                            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
                            // ('tap' fires before 'scroll')
                            tapTimeout = setTimeout(function () {

                                // trigger universal 'tap' with the option to cancelTouch()
                                // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                                var event = $.Event('tap');
                                event.cancelTouch = cancelAll;
                                // [by paper] fix -> "TypeError: 'undefined' is not an object (evaluating 'touch.el.trigger'), when double tap
                                if (touch.el) touch.el.trigger(event);

                                // trigger double tap immediately
                                if (touch.isDoubleTap) {
                                    if (touch.el) touch.el.trigger('doubleTap');
                                    touch = {}
                                }

                                // trigger single tap after 250ms of inactivity
                                else {
                                    touchTimeout = setTimeout(function () {
                                        touchTimeout = null
                                        if (touch.el) touch.el.trigger('singleTap');
                                        touch = {}
                                    }, 250)
                                }
                            }, 0)
                        } else {
                            touch = {}
                        }
                    deltaX = deltaY = 0

                })
                // when the browser window loses focus,
                // for example when a modal dialog is shown,
                // cancel all ongoing events
                .on('touchcancel MSPointerCancel pointercancel', function (e) {
                    console.log('cancel', 'e', e.type);
                    cancelAll();
                });

            // scrolling the window indicates intention of the user
            // to scroll, not tap or swipe, so cancel all ongoing events
            $(window).on('scroll', function () {
                console.log('scroll');
                cancelAll();
            })
        });

        ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
            'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function (eventName) {
            $.fn[eventName] = function (callback) {
                return this.on(eventName, callback)
            }
        })
    })(Zepto);

    //$.ajax 发送请求
    (function ($) {
        var jsonpID = +new Date(),
            document = window.document,
            key,
            name,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            scriptTypeRE = /^(?:text|application)\/javascript/i,
            xmlTypeRE = /^(?:text|application)\/xml/i,
            jsonType = 'application/json',
            htmlType = 'text/html',
            blankRE = /^\s*$/,
            originAnchor = document.createElement('a');

        originAnchor.href = window.location.href;

        //触发自定义事件并且如果阻止默认事件触发返回false
        function triggerAndReturn(context, eventName, data) {
            var event = $.Event(eventName);
            $(context).trigger(event, data);
            return !event.isDefaultPrevented()
        }

        //触发ajax的全局事件
        function triggerGlobal(settings, context, eventName, data) {
            if (settings.global) return triggerAndReturn(context || document, eventName, data)
        }

        //正在ajax请求数量
        $.active = 0;

        //第一次ajax触发时触发,绑定在document上
        function ajaxStart(settings) {
            if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
        }

        //所有ajax都已经停止触发,绑定在document上
        function ajaxStop(settings) {
            if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
        }

        //触发beforeSend事件或全局ajaxBeforeSend事件，如果有一个返回false,则取消此次请求；否则触发ajaxSend全局事件
        function ajaxBeforeSend(xhr, settings) {
            var context = settings.context;
            if (settings.beforeSend.call(context, xhr, settings) === false ||
                triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
                return false;

            triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
        }

        //请求成功调用函数
        function ajaxSuccess(data, xhr, settings, deferred) {
            var context = settings.context, status = 'success';
            settings.success.call(context, data, status, xhr);
            if (deferred) deferred.resolveWith(context, [data, status, xhr]);
            triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
            ajaxComplete(status, xhr, settings)
        }

        //请求失败调用函数 type: "timeout", "error", "abort", "parsererror"
        function ajaxError(error, type, xhr, settings, deferred) {
            var context = settings.context;
            settings.error.call(context, xhr, type, error);
            if (deferred) deferred.rejectWith(context, [xhr, type, error]);
            triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type]);
            ajaxComplete(type, xhr, settings)
        }

        //请求完成调用函数 status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
        function ajaxComplete(status, xhr, settings) {
            var context = settings.context;
            settings.complete.call(context, xhr, status);
            triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
            ajaxStop(settings)
        }

        //执行自定义过滤函数
        function ajaxDataFilter(data, type, settings) {
            if (settings.dataFilter == empty) return data;
            var context = settings.context;
            return settings.dataFilter.call(context, data, type)
        }

        // Empty function, used as default callback
        function empty() {
        }

        $.ajaxJSONP = function (options, deferred) {
            if (!('type' in options)) return $.ajax(options)

            var _callbackName = options.jsonpCallback,
                callbackName = ($.isFunction(_callbackName) ?
                        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
                script = document.createElement('script'),
                originalCallback = window[callbackName],
                responseData,
                abort = function (errorType) {
                    $(script).triggerHandler('error', errorType || 'abort')
                },
                xhr = {abort: abort}, abortTimeout

            if (deferred) deferred.promise(xhr)

            $(script).on('load error', function (e, errorType) {
                clearTimeout(abortTimeout)
                $(script).off().remove()

                if (e.type == 'error' || !responseData) {
                    ajaxError(null, errorType || 'error', xhr, options, deferred)
                } else {
                    ajaxSuccess(responseData[0], xhr, options, deferred)
                }

                window[callbackName] = originalCallback
                if (responseData && $.isFunction(originalCallback))
                    originalCallback(responseData[0])

                originalCallback = responseData = undefined
            })

            if (ajaxBeforeSend(xhr, options) === false) {
                abort('abort')
                return xhr
            }

            window[callbackName] = function () {
                responseData = arguments
            }

            script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
            document.head.appendChild(script)

            if (options.timeout > 0) abortTimeout = setTimeout(function () {
                abort('timeout')
            }, options.timeout)

            return xhr
        };

        //包含Ajax请求的默认设置的全局对象
        $.ajaxSettings = {
            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: empty,
            // Callback that is executed if the request succeeds
            success: empty,
            // Callback that is executed the the server drops error
            error: empty,
            // Callback that is executed on request complete (both: error and success)
            complete: empty,
            // The context for the callbacks
            context: null,
            // Whether to trigger "global" Ajax events
            global: true,
            // Transport
            xhr: function () {
                return new window.XMLHttpRequest()
            },
            // MIME types mapping
            // IIS returns Javascript as "application/x-javascript"
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: jsonType,
                xml: 'application/xml, text/xml',
                html: htmlType,
                text: 'text/plain'
            },
            // Whether the request is to another domain
            crossDomain: false,
            // Default timeout
            timeout: 0,
            // Whether data should be serialized to string
            processData: true,
            // Whether the browser should be allowed to cache GET responses
            cache: true,
            //Used to handle the raw response data of XMLHttpRequest.
            //This is a pre-filtering function to sanitize the response.
            //The sanitized response should be returned
            dataFilter: empty
        };

        //根据媒体类型获取dataType:html,json,scirpt,xml,text等
        function mimeToDataType(mime) {
            if (mime) mime = mime.split(';', 2)[0];
            return mime && ( mime == htmlType ? 'html' :
                    mime == jsonType ? 'json' :
                        scriptTypeRE.test(mime) ? 'script' :
                            xmlTypeRE.test(mime) && 'xml' ) || 'text'
        }

        //将查询参数追加到URL后面
        function appendQuery(url, query) {
            if (query == '') return url;
            return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }

        // serialize payload and append it to the URL for GET requests
        function serializeData(options) {
            //对于非Get请求。是否自动将data转换为字符串
            if (options.processData && options.data && $.type(options.data) != "string")
                options.data = $.param(options.data, options.traditional);
            //get请求，将序列化的数据追加到url后面
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
                options.url = appendQuery(options.url, options.data), options.data = undefined
        }

        $.ajax = function (options) {
            var settings = $.extend({}, options || {}),
                deferred = $.Deferred && $.Deferred(),
                urlAnchor, hashIndex;
            //复制默认配置值到选项中(如果选项中没设置)
            for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key];

            //触发ajaxStart时间，可在document进行监听
            ajaxStart(settings);

            //判断是否跨域(通过页面url和接口url进行比较,判断ip协议和端口号是否相等)
            if (!settings.crossDomain) {
                urlAnchor = document.createElement('a');
                urlAnchor.href = settings.url;
                //解决ie的hack
                urlAnchor.href = urlAnchor.href;
                settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
            }

            //未设置url，取当前地址栏(如果有hash，截掉hash)
            if (!settings.url) settings.url = window.location.toString();
            if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex);
            serializeData(settings);

            ///\?.+=\?/.test(settings.url):有xxx.html?a=1?=cccc类似形式，为jsonp
            var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url);
            if (hasPlaceholder) dataType = 'jsonp';

            //不设置缓存，加时间戳 '_=' + Date.now()
            if (settings.cache === false || (
                    (!options || options.cache !== true) &&
                    ('script' == dataType || 'jsonp' == dataType)
                ))
                settings.url = appendQuery(settings.url, '_=' + Date.now());

            //如果是jsonp,调用$.ajaxJSONP,不走XHR，走script
            if ('jsonp' == dataType) {
                if (!hasPlaceholder)  //判断url是否有类似jsonp的参数
                    settings.url = appendQuery(settings.url,
                        settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?');
                return $.ajaxJSONP(settings, deferred)
            }

            //媒体类型
            var mime = settings.accepts[dataType],
                headers = {},
                //设置请求头的方法
                setHeader = function (name, value) {
                    headers[name.toLowerCase()] = [name, value]
                },
                //如果URL没协议，读取本地URL的协议
                protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
                xhr = settings.xhr(),
                nativeSetHeader = xhr.setRequestHeader,
                abortTimeout;

            //将xhr设为只读Deferred对象，不能更改状态
            if (deferred) deferred.promise(xhr);

            //如果没有跨域(x-requested-with XMLHttpRequest 表明是AJax异步;x-requested-with null 表明同步,浏览器工具栏未显示,在后台request可以获取到)
            if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest');
            setHeader('Accept', mime || '*/*');
            if (mime = settings.mimeType || mime) {
                //媒体数据源里对应多个，如 script: 'text/javascript, application/javascript, application/x-javascript',设置最新的写法
                if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
                //对Mozilla的修正
                xhr.overrideMimeType && xhr.overrideMimeType(mime)
            }
            /**
             * Content-Type: 内容类型指定响应的HTTP内容类型。决定浏览器将以什么形式、什么编码读取这个文件. 如果未指定ContentType，默认为TEXT/HTML。
             * 当action为get时候，浏览器用x-www-form-urlencoded的编码方式把form数据转换成一个字串（name1=value1&name2=value2...），然后把这个字串append到
             * url后面，用?分割，加载这个新的url；当action为post时候，浏览器把form数据封装到http body中，然后发送到server。
             * 如果method==get，则请求头部不用设置Content-Type，若method==post，则请求头部的Content-Type默认设置'application/x-www-form-urlencoded'
             * */
            if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
                setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');

            //设置请求头
            if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
            xhr.setRequestHeader = setHeader;

            xhr.onreadystatechange = function () {
                /**
                 0：请求未初始化（还没有调用 open()）。
                 1：请求已经建立，但是还没有发送（还没有调用 send()）。
                 2：请求已发送，正在处理中（通常现在可以从响应中获取内容头）。
                 3：请求在处理中；通常响应中已有部分数据可用了，但是服务器还没有完成响应的生成。
                 4：响应已完成；您可以获取并使用服务器的响应了。
                 */
                if (xhr.readyState == 4) {
                    xhr.onreadystatechange = empty;
                    //使用了闭包
                    clearTimeout(abortTimeout);
                    var result, error = false;
                    /**
                     * 根据状态来判断请求是否成功
                     * >=200 && < 300 表示成功
                     * 304 文件未修改 成功
                     * xhr.status == 0 && protocol == 'file:'  未请求，打开的本地文件，非localhost  ip形式
                     * */
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                        //getResponseHeader:从响应信息中获取指定的http头
                        dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                        //响应值
                        if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
                            result = xhr.response;
                        else {
                            result = xhr.responseText;
                            try {
                                /**
                                 * http://perfectionkills.com/global-eval-what-are-the-options/
                                 * sanitize response accordingly if data filter callback provided
                                 * (1,eval)(result)  (1,eval)这是一个典型的逗号操作符，返回最右边的值
                                 * (1,eval)  eval 的区别是:前者是一个值，不可以再覆盖。后者是变量,如var a = 1; (1,a) = 1;会报错；
                                 * (1,eval)(result)  eval(result) 的区别是:前者变成值后，只能读取window域下的变量。而后者，遵循作用域链，从局部变量上溯到window域
                                 * 显然(1,eval)(result)  避免了作用域链的上溯操作，性能更好
                                 * */
                                result = ajaxDataFilter(result, dataType, settings);
                                if (dataType == 'script') (1, eval)(result);
                                else if (dataType == 'xml') result = xhr.responseXML;
                                else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
                            } catch (e) {
                                error = e
                            }
                            //解析出错，抛出 'parsererror'事件
                            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
                        }
                        //执行success
                        ajaxSuccess(result, xhr, settings, deferred)
                    } else {
                        //如果请求出错,xhr.status = 0 / null 执行abort,其他执行error
                        ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                    }
                }
            };

            //执行请求前置器,若返回false则中断请求
            if (ajaxBeforeSend(xhr, settings) === false) {
                xhr.abort();
                ajaxError(null, 'abort', xhr, settings, deferred);
                return xhr
            }

            // 这是一个小技巧，默认async为true，若settings里面设置了，则为设置的值
            var async = 'async' in settings ? settings.async : true;
            //准备xhr请求
            xhr.open(settings.type, settings.url, async, settings.username, settings.password);

            //对象包含的属性被逐字复制到XMLHttpRequest的实例(如设置跨域凭证withCredentials)
            if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

            //设置请求头
            for (name in headers) nativeSetHeader.apply(xhr, headers[name])

            //超时处理：设置了settings.timeout，超时后调用xhr.abort()中断请求
            if (settings.timeout > 0) abortTimeout = setTimeout(function () {
                xhr.onreadystatechange = empty;
                xhr.abort();
                ajaxError(null, 'timeout', xhr, settings, deferred)
            }, settings.timeout);

            // avoid sending empty string (#319)
            xhr.send(settings.data ? settings.data : null);
            return xhr
        };

        //进行可选参数(data/success)校验
        function parseArguments(url, data, success, dataType) {
            if ($.isFunction(data)) dataType = success, success = data, data = undefined;
            if (!$.isFunction(success)) dataType = success, success = undefined;
            return {
                url: url
                , data: data
                , success: success
                , dataType: dataType
            }
        }

        //$.ajax的简写方式 get请求
        $.get = function (/* url, data, success, dataType */) {
            return $.ajax(parseArguments.apply(null, arguments))
        };

        //$.ajax的简写方式 post请求
        $.post = function (/* url, data, success, dataType */) {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return $.ajax(options)
        };

        //$.ajax的简写方式 获取JSON数据
        $.getJSON = function (/* url, data, success */) {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return $.ajax(options)
        };

        /**
         * 通过GET Ajax载入远程HTML内容代码并插入至当前的dom元素中
         * 可以使用匹配selector选择器的HTML内容来更新集合,如$('#some_element').load('/foo.html #bar')
         * 如果没有给定CSS选择器，将使用完整的返回文本
         * 在没有选择器的情况下，任何javascript块都会添加。如果带上选择器，匹配选择器内的script将会被删除
         * */
        $.fn.load = function (url, data, success) {
            if (!this.length) return this;
            var self = this, parts = url.split(/\s/), selector,
                options = parseArguments(url, data, success),
                callback = options.success;
            if (parts.length > 1) options.url = parts[0], selector = parts[1];
            // response.replace(rscript, "") 过滤出script标签
            //$('<div>').html(response.replace(rscript, ""))  innerHTML方式转换成DOM
            options.success = function (response) {
                self.html(selector ?
                    $('<div>').html(response.replace(rscript, "")).find(selector)
                    : response);
                //dom操作后执行成功回调函数(注:callback存储的是自定义成功回调函数,options.success后面被重新赋值为ajax回调函数,不会死循环)
                callback && callback.apply(self, arguments)
            };
            $.ajax(options);
            return this
        };

        var escape = encodeURIComponent;

        //序列化
        function serialize(params, obj, traditional, scope) {
            var type, array = $.isArray(obj), hash = $.isPlainObject(obj);
            $.each(obj, function (key, value) {
                type = $.type(value);
                //如果是第二次递归调用的话，需要处理一下key的值
                if (scope) key = traditional ? scope :
                    scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']';
                // 处理[{name:'',value:''},{name:'',value:''}]这种类型
                if (!scope && array) params.add(value.name, value.value);
                // 处理嵌套对象如{'key':[]}或者{'key':{}}
                else if (type == "array" || (!traditional && type == "object"))
                    serialize(params, value, traditional, key);
                else params.add(key, value)
            })
        }

        /**
         * 序列化一个对象，在Ajax请求中提交的数据使用URL编码的查询字符串表示形式。
         * 如果shallow设置为true。嵌套对象不会被序列化，嵌套数组的值不会使用放括号在他们的key上。
         * */
        $.param = function (obj, traditional) {
            var params = [];
            params.add = function (key, value) {
                if ($.isFunction(value)) value = value();
                if (value == null) value = "";
                this.push(escape(key) + '=' + escape(value))
            };
            serialize(params, obj, traditional);
            return params.join('&').replace(/%20/g, '+')
        }
    })(Zepto);

    //提供 $.Deferred promises API. 依赖"callbacks" 模块.
    (function ($) {
        var slice = Array.prototype.slice;

        function Deferred(func) {
            var tuples = [
                    // 状态切换方法名、对应状态执行方法名、函数回调列表、最终状态
                    ["resolve", "done", $.Callbacks({once: 1, memory: 1}), "resolved"],
                    ["reject", "fail", $.Callbacks({once: 1, memory: 1}), "rejected"],
                    ["notify", "progress", $.Callbacks({memory: 1})]
                ],
                //Promise的初始状态
                state = "pending",
                /**
                 * promise只包含执行阶段的方法always(),then(),done(),fail(),progress()及辅助方法state()、promise()等。
                 * deferred则在继承promise的基础上，增加切换状态的方法，resolve()/resolveWith(),reject()/rejectWith(),notify()/notifyWith()
                 * 所以称promise是deferred的只读副本
                 * */
                promise = {
                    // 返回promise状态
                    state: function () {
                        return state
                    },
                    //成功/失败均回调调用
                    always: function () {
                        deferred.done(arguments).fail(arguments);
                        return this
                    },
                    then: function (/* fnDone [, fnFailed [, fnProgress]] */) {
                        var fns = arguments;
                        //生成新的deferred，即defer；并为旧deferred添加新的回调函数；返回新的promise对象，then方法后的回调会被添加到新的回调函数列表中
                        return Deferred(function (defer) {
                            $.each(tuples, function (i, tuple) {
                                //i==0:fnDone；i==1:fnFailed；i==2:fnProgress
                                var fn = $.isFunction(fns[i]) && fns[i];
                                //为旧deferred的done/fail/progress方法添加回调函数，回调函数不会立即执行
                                deferred[tuple[1]](function () {
                                    //旧deferred状态切换方法名触发时，调用相应的then函数参数
                                    var returned = fn && fn.apply(this, arguments);
                                    /**
                                     * 如果then的函数参数调用返回了值，而且值存在promise方法，那么执行promise方法，
                                     * 并将defer的resolve/reject/notify添加到promise的done/fail/progress中，
                                     * 如果返回的继承promise的对象状态被切换，那么defer的相应状态切换方法同时被调用
                                     * */
                                    if (returned && $.isFunction(returned.promise)) {
                                        returned.promise()
                                            .done(defer.resolve)
                                            .fail(defer.reject)
                                            .progress(defer.notify)
                                    } else {
                                        /**
                                         * 如果then方法有返回值，则新defer的所有回调函数都使用该值作为参数，否则使用旧deferred回调参数
                                         * 在非严格模式下，this为null或undefined时为被自动替换成全局对象window
                                         * */
                                        var context = this === promise ? defer.promise() : this,
                                            values = fn ? [returned] : arguments;
                                        defer[tuple[0] + "With"](context, values)
                                    }
                                })
                            });
                            fns = null
                        }).promise()
                    },
                    //如果存在obj，则将promise对象的方法赋值给obj；否则返回promise对象
                    promise: function (obj) {
                        return obj != null ? $.extend(obj, promise) : promise
                    }
                },
                deferred = {};
            //给deferred添加切换状态方法
            $.each(tuples, function (i, tuple) {
                var list = tuple[2], //回调函数列表
                    stateString = tuple[3];  //promise最终状态
                //扩展promise的done、fail、progress为Callback的add方法，使其成为回调列表，使用的时候.done(func) func就添加到了回调函数中
                promise[tuple[1]] = list.add;
                /**
                 * 切换的状态是resolve成功/reject失败；添加首组方法做预处理，修改state的值，使成功或失败互斥；
                 * disable后就算上次触发了add时还是不会立即执行，memory被设置为undefined
                 * 锁定progress回调列表，锁定后progress回调列表不能再被触发
                 * */
                if (stateString) {
                    list.add(function () {
                        state = stateString;
                        //i^1  ^异或运算符  0^1=1 1^1=0，成功或失败回调互斥，调用一方，禁用另一方
                    }, tuples[i ^ 1][2].disable, tuples[2][2].lock)
                }
                //添加切换状态方法 resolve()/resolveWith(),reject()/rejectWith(),notify()/notifyWith()
                deferred[tuple[0]] = function () {
                    deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                    return this
                };
                deferred[tuple[0] + "With"] = list.fireWith
            });
            //deferred包装成promise 继承promise对象的方法
            promise.promise(deferred);
            //传递了参数func，执行
            if (func) func.call(deferred, deferred);
            //返回deferred对象
            return deferred
        }

        //主要用于多异步队列处理：多异步队列都成功，执行成功方法，一个失败，执行失败方法。也可以传非异步队列对象
        $.when = function (sub) {
            var resolveValues = slice.call(arguments),
                //队列个数
                len = resolveValues.length,
                i = 0,
                //子deferred计数
                remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
                //主def，如果是1个fn，直接以它为主def，否则建立新的Def
                deferred = remain === 1 ? sub : Deferred(),
                progressValues, progressContexts, resolveContexts,
                updateFn = function (i, ctx, val) {
                    return function (value) {
                        ctx[i] = this;
                        val[i] = arguments.length > 1 ? slice.call(arguments) : value;
                        if (val === progressValues) {
                            //如果是通知，调用主函数的通知，通知可以调用多次
                            deferred.notifyWith(ctx, val)
                        } else if (!(--remain)) {
                            //如果是成功，则需等成功计数为0，即所有子def都成功执行了，remain变为0，再调用主函数的成功
                            deferred.resolveWith(ctx, val)
                        }
                    }
                };

            //如果参数列表长度大于一，那么校验是否为promise对象，如果不是则将remain减一
            if (len > 1) {
                progressValues = new Array(len);
                progressContexts = new Array(len);
                resolveContexts = new Array(len);
                for (; i < len; ++i) {
                    if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                        resolveValues[i].promise()
                            .done(updateFn(i, resolveContexts, resolveValues))
                            .fail(deferred.reject) //直接挂入主def的失败通知函数,当某个子def失败时，调用主def的切换失败状态方法，执行主def的失败函数列表
                            .progress(updateFn(i, progressContexts, progressValues))
                    } else {
                        //非def，直接标记成功，减1
                        --remain
                    }
                }
            }
            //比如无参数，或者所有子队列全为非def，直接切换到成功状态，后面就算返回了promise对象，添加的回调函数也不会被触发
            if (!remain) deferred.resolveWith(resolveContexts, resolveValues);
            return deferred.promise()
        };

        $.Deferred = Deferred
    })(Zepto);

    //为"deferred"模块提供 $.Callbacks。
    (function ($) {
        // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
        // Option flags:
        //   - once: 回调只能触发一次
        //   - memory: 记住最近的上下文和参数，如果memory为true则添加的时候会执行一次
        //   - stopOnFalse: 当某个回调函数返回false时中断执行
        //   - unique: 一个回调函数只能被添加一次
        $.Callbacks = function (options) {
            options = $.extend({}, options);

            var memory, // 记录上一次触发回调函数列表时的参数，之后添加的函数都用这参数立即执行
                fired,  // 是否回调过标志量
                firing,  // 回调函数列表是否正在执行中
                firingStart, // 开始回调函数的下标
                firingLength, // 回调函数列表长度
                firingIndex, // 回调列表索引值
                list = [], // 回调数据源:回调列表
                stack = !options.once && [], //回调只能触发一次的时候，stack永远为false；多次触发永远为数组
                //触发回调底层函数
                fire = function (data) {
                    memory = options.memory && data;
                    fired = true;
                    firingIndex = firingStart || 0;
                    firingStart = 0;
                    firingLength = list.length;
                    firing = true;
                    //遍历回调列表，全部回调函数都执行，参数是传递过来的data
                    for (; list && firingIndex < firingLength; ++firingIndex) {
                        //如果 list[ firingIndex ] 为false，且stopOnFalse（中断）模式，则中断回掉执行，设置memory为false
                        if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                            memory = false;
                            break
                        }
                    }
                    //回调执行完毕
                    firing = false;
                    if (list) {
                        //stack里还缓存有未执行的回调，则执行stack里的回调
                        if (stack) stack.length && fire(stack.shift());
                        //如果只执行一次而且memory为true(类型转换),那么清空回调函数(不禁用是因为设置了memory，add执行时会调用)
                        else if (memory) list.length = 0;
                        //如果只执行一次而且memory为false(类型转换),那么禁用回调函数
                        else Callbacks.disable();
                    }
                },
                Callbacks = {
                    //添加回调函数
                    add: function () {
                        if (list) {
                            var start = list.length,
                                add = function (args) {
                                    $.each(args, function (_, arg) {
                                        if (typeof arg === "function") {
                                            //非unique，或者是unique，但回调列表未添加过
                                            if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                                        }
                                        //是数组/伪数组，添加，重新遍历
                                        else if (arg && arg.length && typeof arg !== 'string') add(arg)
                                    })
                                };
                            //添加进列表
                            add(arguments);
                            //如果列表正在执行中，修正长度，使得新添加的回调也可以执行
                            if (firing) firingLength = list.length;
                            else if (memory) {
                                //memory 模式下，修正开始下标
                                firingStart = start;
                                //立即执行所有回调
                                fire(memory)
                            }
                        }
                        return this
                    },
                    //从回调列表里删除一个或一组回调函数
                    remove: function () {
                        if (list) {
                            $.each(arguments, function (_, arg) {
                                var index;
                                while ((index = $.inArray(arg, list, index)) > -1) {
                                    list.splice(index, 1);
                                    // Handle firing indexes
                                    if (firing) {
                                        //避免回调列表溢出
                                        if (index <= firingLength) --firingLength;
                                        //如果移除的函数已经执行过了，则将迭代下标减一，否则会漏掉回调函数没执行
                                        if (index <= firingIndex) --firingIndex
                                    }
                                }
                            })
                        }
                        return this
                    },
                    //检查指定的回调函数是否在回调列表中；如果参数为空，则方法用来表明是否存在回调函数
                    has: function (fn) {
                        return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
                    },
                    //清空回调函数
                    empty: function () {
                        firingLength = list.length = 0;
                        return this
                    },
                    //禁用回调函数
                    disable: function () {
                        list = stack = memory = undefined;
                        return this
                    },
                    //是否禁用了回调函数
                    disabled: function () {
                        return !list
                    },
                    //锁定回调函数
                    lock: function () {
                        stack = undefined;
                        //非memory模式下，禁用列表
                        if (!memory) Callbacks.disable();
                        return this
                    },
                    //是否是锁定的(一次性调用的时，为true)
                    locked: function () {
                        return !stack
                    },
                    //用上下文、参数执行列表中的所有回调函数
                    fireWith: function (context, args) {
                        //如果调用过一次了fired被设置为true，如果设置once为true的话(可类型转换)，则不执行回调函数
                        if (list && (!fired || stack)) {
                            args = args || [];
                            args = [context, args.slice ? args.slice() : args];
                            //正在回调中,存入stack
                            if (firing) stack.push(args);
                            //否则立即回调,外层fire函数
                            else fire(args);
                        }
                        return this
                    },
                    //执行回调
                    fire: function () {
                        return Callbacks.fireWith(this, arguments)
                    },
                    //回调列表是否被回调过
                    fired: function () {
                        return !!fired
                    }
                };
            return Callbacks
        }
    })(Zepto);

    //form表单(序列化form表单里面字段和注册submit事件以及触发表单提交事件)
    (function ($) {
        //序列表单内容为JSON数组
        $.fn.serializeArray = function () {
            var name, type, result = [],
                add = function (value) {
                    if (value.forEach) return value.forEach(add);
                    result.push({name: name, value: value})
                };
            if (this[0]) $.each(this[0].elements, function (_, field) {
                type = field.type;
                name = field.name;
                //排除fieldset，禁用元素，submit,reset,button，file和未被选中的radio,checkbox,原因是这些元素不需要传递给服务器
                if (name && field.nodeName.toLowerCase() != 'fieldset' && !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                    ((type != 'radio' && type != 'checkbox') || field.checked))
                //{name:value}形式加入到结果数组中
                    add($(field).val())
            });
            return result
        };

        //序列表表单内容为查询字符串
        $.fn.serialize = function () {
            var result = [];
            this.serializeArray().forEach(function (elm) {
                //每个key-value，都保守URI编码
                result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
            });
            return result.join('&')
        };

        //提交表单
        $.fn.submit = function (callback) {
            //0 in arguments 判断是否传了回调函数，传了回调，就当成绑定submit事件
            if (0 in arguments) this.bind('submit', callback);
            else if (this.length) { //没有传回调，当成直接提交，this.length表示有表单元素
                var event = $.Event('submit');
                //get和eq方法不同，get方法返回的dom节点，eq返回的还是Zepto对象集合
                this.eq(0).trigger(event);
                if (!event.isDefaultPrevented()) this.get(0).submit()
            }
            return this
        }
    })(Zepto);

    //ie模块 getComputedStyle方法不应该报错当调用的时候传一个无效的元素作为参数(增加支持桌面的Internet Explorer 10+和Windows Phone 8。)
    (function () {
        // getComputedStyle shouldn't freak out when called
        // without a valid element as argument
        try {
            getComputedStyle(undefined)
        } catch (e) {
            var nativeGetComputedStyle = getComputedStyle
            window.getComputedStyle = function (element, pseudoElement) {
                try {
                    return nativeGetComputedStyle(element, pseudoElement)
                } catch (e) {
                    return null
                }
            }
        }
    })();

    //data模块 一个全面的data()方法, 能够在内存中存储任意对象
    (function ($) {
        //+new Date() 转化为Number类型，会调用Date.prototype上的valueOf方法，等同于Date.prototype.getTime()
        var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
            exp = $.expando = 'Zepto' + (+new Date()), emptyArray = [];

        // Get value from node:
        // 1. first try key as given,
        // 2. then try camelized key,
        // 3. fall back to reading "data-*" attribute.
        function getData(node, name) {
            var id = node[exp], store = id && data[id];
            //如果没有指定属性值，则返回整个属性存储对象
            if (name === undefined) return store || setData(node);
            else {
                if (store) {
                    if (name in store) return store[name];
                    var camelName = camelize(name);
                    if (camelName in store) return store[camelName]
                }
                //调用之前核心库里面的$.fn.data方法获取元素的属性值
                return dataAttr.call($(node), name)
            }
        }

        // Store value under camelized key on node
        function setData(node, name, value) {
            //第一次为设置值，并将所有dom元素上的自定义属性放到缓存中；后面则从缓存中提取数据
            var id = node[exp] || (node[exp] = ++$.uuid),
                store = data[id] || (data[id] = attributeData(node));
            if (name !== undefined) store[camelize(name)] = value;
            return store
        }

        // Read all "data-*" attributes from a node
        //将node中所有自定义属性组成对象返回
        function attributeData(node) {
            var store = {};
            $.each(node.attributes || emptyArray, function (i, attr) {
                if (attr.name.indexOf('data-') == 0)
                    store[camelize(attr.name.replace('data-', ''))] =
                        $.zepto.deserializeValue(attr.value)
            });
            return store
        }

        //根据参数设置或提取数据
        $.fn.data = function (name, value) {
            return value === undefined ?
                // set multiple values via object
                $.isPlainObject(name) ?
                    this.each(function (i, node) {
                        $.each(name, function (key, value) {
                            setData(node, key, value)
                        })
                    }) :
                    // get value from first element
                    (0 in this ? getData(this[0], name) : undefined) :
                // set value on all elements
                this.each(function () {
                    setData(this, name, value)
                })
        };

        //调用$.fn.data方法
        $.data = function (elem, name, value) {
            return $(elem).data(name, value)
        };

        //判断dom元素是否存储了缓存对象
        $.hasData = function (elem) {
            var id = elem[exp], store = id && data[id];
            return store ? !$.isEmptyObject(store) : false
        };

        //移除dom元素上的缓存对象
        $.fn.removeData = function (names) {
            if (typeof names == 'string') names = names.split(/\s+/);
            return this.each(function () {
                var id = this[exp], store = id && data[id];
                if (store) $.each(names || store, function (key) {
                    delete store[names ? camelize(this) : key]
                })
            })
        }

        // Generate extended `remove` and `empty` functions
        //调用remove和empty进行dom操作的同时移除dom元素上的缓存对象
        ;
        ['remove', 'empty'].forEach(function (methodName) {
            var origFn = $.fn[methodName];
            $.fn[methodName] = function () {
                var elements = this.find('*');
                if (methodName === 'remove') elements = elements.add(this);
                elements.removeData();
                return origFn.call(this)
            }
        })
    })(Zepto);
    return Zepto
}));