(function(window, undefined) {
    //兼容的push方法
    var push = [].push;
    var slice = [].slice;
    try {
        //系统支持就用
        var div = document.createElement('div');
        div.innerHTML = '<p></p>';
        var p = div.getElementsByTagName('p');
        push.apply(test, p);
        //不支持自己写算法实现
    } catch (e) {
        push = {
            apply: function(array1, array2) {
                for (var i = 0; i < array2.length; i++) {
                    //把数组array2的每一项放入新数组中
                    array1[array1.length++] = array2[i];
                }
            }
        }
    }

    function myJs(html) {
        return new myJs.prototype.init(html);
    }

    myJs.fn = myJs.prototype = {
        constructor: myJs,
        //原型中的selector属性是用来区分使用选择器字符串创建的myJs对象和其他myJs对象，
        //selector属性会保存创建的myJs对象的选择器字符串
        selector: '',
        //原型中的type属性是用来区分myJs对象和其他对象用的
        type: 'myJs',
        length: 0,
        init: function(html) {
            this.events = {};
            if (html == null || html == '') {
                return;
            }
            //如果是一个函数 那么就将函数绑定到onload上然后返回
            if (typeof html == 'function') {
                //使用oldFn变量保存绑定在window.onload中的事件处理函数
                var oldFn = window.onload;
                //判断oldFn中保存的是否是事件处理函数
                if (typeof oldFn === 'function') {
                    //若是，就给onload绑定一个匿名函数,在匿名函数中先执行oldFn函数再执形传入的html函数
                    window.onload = function() {
                            oldFn();
                            html();
                        }
                        //如果onload什么也没有绑定 就直接给onload的赋值
                } else {
                    window.onload = html;
                }
            }
            //当传入的html参数的类型是字符串时
            if (typeof html == 'string') {
                //判断字符串开头第一位是否是左尖括号
                if (/^</.test(html)) {
                    push.apply(this, parseHTML(html));
                } else {
                    push.apply(this, myJs.select(html));
                    this.selector = html;
                }
            }
            if (html.type == 'myJs') {
                push.apply(this, html);
                this.selector = html.selector;
            }
            if (myJs.isDom(html)) {
                //虽然将html元素添加到了this对象中的第0个元素中

                this[0] = html;
                //但是this对象中并没有记录个数的length属性，所以我们要手动添加length属性
                this.length = 1;
            }

        }
    };

    myJs.fn.init.prototype = myJs.fn;


    //给myJs函数添加extend,给myJs.fn添加extend
    myJs.extend = myJs.fn.extend = function(obj) {
        for (var k in obj) {
            this[k] = obj[k];
        }
    }

    //工具方法
    myJs.extend({
        //判断是否是字符串
        isString: function(data) {
            return typeof data == 'string';
        },
        //判断是否是对象
        isObject: function(data) {
            return typeof data == 'object';
        },
        //判断是否是dom元素
        isDom: function(dom) {
            if (dom.nodeType) {
                return true;
            }
            return false;
        },

        //兼容的获取style样式写法
        getStyle: function(dom, name) {
            if (dom.currentStyle) {
                return dom.currentStyle[name];
            } else {
                return window.getComputedStyle(dom)[name];
            }
        }

    });
    myJs.extend({
        //静态操作方法
        each: function(arr, func) {
            var i;
            //判断是数组     和    伪数组
            if (arr instanceof Array || arr.length >= 0) {
                //遍历数组和伪数组
                for (i = 0; i < arr.length; i++) {
                    func.call(arr[i], i, arr[i]);
                }
            } else {
                //遍历对象
                for (i in arr) {
                    func.call(arr[i], i, arr[i]);
                }
            }
            return arr;
        },
        map: function(arr, func) {
            var i, temp, res = [];
            if (arr instanceof Array || arr.length >= 0) {
                //遍历数组和伪数组
                for (i = 0; i < arr.length; i++) {
                    temp = func(arr[i], i);
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            } else {
                //遍历对象
                for (i in arr) {
                    temp = func(arr[i], i);
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            }
            return res;
        }
    });

    //DOM操作方法模块
    myJs.fn.extend({
        //dom可能的情形是：选择器字符串'div',myJs对象,dom节点
        /*appendTo: function(dom) {
            if (dom.type === 'myJs') {
                for (var i = 0; i < this.length; i++) {
                    dom[0].appendChild(this[i]);
                }
            } else if (dom.nodeType) {
                for (var i = 0; i < this.length; i++) {
                    dom.appendChild(this[i]);
                }
            }
        }*/
        appendTo: function(dom) {
            //使用dom作为参数创建一个myJs对象iObj
            var iObj = myJs(dom);
            //var iObj = this.construcotr(dom);
            //将this对象中存储的所有dom元素添加到iObj中的第j个元素里去
            //由于需要具有链式结构的性能
            //创建一个空的myJs对象newObj
            var newObj = myJs(); //myJs.constructor()
            for (var i = 0; i < this.length; i++) {
                //使用for循环 遍历iObj的所有元素
                for (var j = 0; j < iObj.length; j++) {
                    var temp = j === 0 ? this[i] : this[i].cloneNode(true);
                    //将this[i]节点克隆出来一份，将克隆的节点添加到iObj[j]中去，
                    //但是会多出来一份，这个时候我们需要判断
                    [].push.call(newObj, temp);
                    iObj[j].appendChild(temp);
                }
            }
            //返回值包含了本体和复制体的newObj对象
            return newObj;
        },
        append: function(dom) {
            myJs(dom).appendTo(this);
            return this;
        },
        prependTo: function(selector) {
            var iObj = myJs(selector);
            var newObj = myJs();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp = j == 0 ? this[i] : this[i].cloneNode(true);
                    push.call(newObj, temp);
                    iObj[j].appendChild(temp);
                }
            }
            return newObj;
        },
        prepend: function(selector) {
            myJs(selector).prependTo(this);
            return this;
        }


    });
    //核心成员模块
    myJs.fn.extend({
        //调用toArray方法返回dom元素数组
        toArray: function() {
            /*var arr = [];
            for (var i = 0; i < this.length; i++) {
                arr.push(this[i]);
            }
            return arr;*/
            //小技巧：利用数组的slice方法来实现toArray的方法
            return slice.call(this, 0);
        },
        //调用get方法返回第index个元素
        get: function(index) {
            //传入的index若是undefined，返回空数组
            if (index === undefined) {
                return this.toArray();
            }
            //若不是undefined，则返回index对应的dom元素
            return this[index];
        },
        //调用eq方法返回包含了对应index下标元素的myJs对象
        eq: function(index) {
            var dom;
            //若传入的index>=0 则返回index对应的dom对象
            if (index >= 0) {
                dom = this.get(index);
            } else {
                //若传入的是负数，则返回的是 length+index 所对应的dom对象
                dom = this.get(this.length + index);
            }
            //最后返回dom对象
            return myJs(dom);
        },
        //调用静态方法中的each方法来遍历this对象中的所有元素
        each: function(func) {
            return myJs.each(this, func);
        },
        //调用静态放法中的map方法来映射this对象中的所有元素
        map: function(func) {
            return myJs.map(this, func);
        }
    });
    //事件处理模块
    myJs.fn.extend({
        on: function(type, func) {
            /* //这里的this是指调用click方法的myJs对象
             this.each(function() {
                 //这里的this是指调用click方法的myJs对象中的每一个DOM元素
                 this.onclick = func;
             });
             //这里的this是指调用click方法的myJs对象
             return this;*/
            //判断events 对象中的type数组是否存在，不存在就手动加上(初始化)
            if (!this.events[type]) {
                this.events[type] = [];
                //将this对象存在that变量中
                var that = this;
                //这里的this是指调用each方法的myJs对象
                //each函数在第一次执行的时候执行一次就可以了
                this.each(function() {
                    //这里的this是指上面myJs对象中的DOM元素
                    //fn函数当事件触发的时候才会执行
                    var fn = function() {
                        for (var i = 0; i < that.events[type].length; i++) {
                            that.events[type][i]();
                        }
                    }
                    if (this.addEventListener) {
                        this.addEventListener(type, fn);
                    } else {
                        this.attachEvent('on' + type, fn);
                    }
                });
            }
            this.events[type].push(func);
            //返回this是为了满足链式编程
            return this;
        },
        off: function(type, func) {
            //把type类型的事件从events对象中取出存入arr数组里
            var arr = this.events[type];
            //倒序arr数组
            for (var i = arr.length - 1; i >= 0; i--) {
                //若是数组中第i个函数与要删除的函数一样
                if (arr[i] === func) {
                    //就把它删除
                    arr.splice(i, 1);
                }
            }

        },
        click: function(func) {
            this.on('click', func);
        },
        hover: function(func1, func2) {
            this.mouseover(func1);
            this.mouseleave(func2);
            return this;
        }
    });

    //遍历事件名字
    myJs.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(' '), function(i, v) {
        //把事件方法追加到myJs的原型上
        myJs.fn[v] = function(fn) {
            this.on(v, fn);
            return this;
        };
    });


    var parseHTML = (function() {
        function parseHTML(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            var res = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                res.push(div.childNodes[i]);
            }
            return res;
        }
        return parseHTML;
    })();

    //基本选择器函数 
    var select = (function() {
        //正则表达式
        var rnative = /\{\s*\[native/;
        var rtrim = /^\s+|\s+$/g;


        //方法检测
        var support = {};
        var res = [];
        support.querySelector = rnative.test(document.querySelectorAll + '');
        support.getElementsByClassName = rnative.test(document.getElementsByClassName + '');
        support.trim = rnative.test(String.prototype.trim + '');
        support.indexOf = rnative.test(Array.indexOf + '');

        //兼容的mytrim方法
        function mystrim(str) {
            if (support.trim) {
                return str.trim();
            } else {
                //把str字符串中符合正则表达式的内容替换成空的字符串
                return str.replace(rtrim, '');
            }
        }
        //兼容的数组indexOf写法
        function myIndexOf(array, seach, startIndex) {
            startIndex = startIndex || 0;
            if (support.indexOf) {
                //系统支持indexOf方法就用
                return array.indexOf(seach, startIndex);
            } else {
                //不支持自己算法实现
                //从索引startIndex处开始遍历array  
                for (var i = startIndex; i < array.length; i++) {
                    //若是数组array中有要搜索的search 就返回索引号i
                    if (array[i] == seach) {
                        return i;
                    }
                }
                //都找不到就返回-1
                return -1;
            }
        }
        //元素去重
        function unique(array) {
            var resArray;
            for (var i = 0; i < array.length; i++) {
                //遍历数组array 在新数组resArray中找不到array中的第i项就把它加入到新数组resArray中
                if (myIndexOf(resArray, array[i]) == -1) {
                    resArray.push(array[i]);
                }
            }
            //最后把resArray作为结果返回
            return resArray;
        }


        //兼容的getElementsByClassName方法
        function getByClassName(className, node) {
            node = node || document;
            if (support.getElementsByClassName) {
                //是否支持getElementsByClassName方法 若是支持就用
                return node.getElementsByClassName(className);
            } else {
                //不支持自己写算法
                var eles = document.getElementsByTagName('*');
                for (var i = 0; i < eles.length; i++) {
                    if ((" " + eles[i].className + " ").indexOf(" " + className + " ") > -1) {
                        res.push(eles[i]);
                    }
                }
                return res;
            }
        }

        function basicSelect(selector, node) {
            node = node || document;
            //检测传入的selector参数是否是字符串
            if (typeof selector != 'string') {
                //不是直接返回结果
                return results;
            }
            //若是，检测传入参数的第一个字符是什么
            if (support.querySelector) {
                return document.querySelectorAll(selector);
            }
            var firstCode = selector.charAt(0);
            if (firstCode == '#') {
                return document.getElementById(selector.slice(1));
            } else if (firstCode == '.') {
                return getByClassName(selector.slice(1), node[i]);
            } else {
                return node.getElementsByTagName(selector);
            }
        }

        function select2(selector, results) {
            var selectors = selector.split(' ');
            var arr = [],
                node = [document];
            for (var j = 0; j < selectors.length; j++) {
                for (var i = 0; i < node.length; i++) {
                    push.apply(arr, document.getElementsByTagName(selectors[j]));
                }
                node = arr;
                arr = [];
            }
            push.apply(results, node);
            return results;

        }




        var selectors;

        function select(selector, results) {
            results = results || [];
            if (typeof selector != 'string') {
                return results;
            }
            if (support.querySelector) {
                push.apply(results, document.querySelectorAll(selector));
                return results;
            }
            selectors = selector.split(',');
            for (var i = 0; i < selectors.length; i++) {

                var subSelector = mystrim(selectors[i]);
                var firstCode = subSelector.charAt(0); //subSelector[0]
                if (firstCode == '#') {
                    results.push(document.getElementById(subSelector.slice(1)));
                } else if (firstCode == '.') {
                    push.apply(results, getByClassName(subSelector.slice(1)));
                } else {
                    push.apply(results, document.getElementsByTagName(subSelector));
                }
            }

            return unique(results);
        }


        return select;
    })();


    myJs.select = select;



    window.myJs = window.I = myJs;



})(window)
