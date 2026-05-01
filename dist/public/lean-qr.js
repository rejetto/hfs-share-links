function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = {}, sourceKeys, key, i;
    if (typeof Reflect !== "undefined" && Reflect.ownKeys) {
        sourceKeys = Reflect.ownKeys(Object(source));
        for(i = 0; i < sourceKeys.length; i++){
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
        return target;
    }
    target = _object_without_properties_loose(source, excluded);
    if (Object.getOwnPropertySymbols) {
        sourceKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceKeys.length; i++){
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {}, sourceKeys = Object.getOwnPropertyNames(source), key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_array(arr) {
    return _array_with_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
window.LeanQR = function() {
    "use strict";
    var t = [
        .2,
        3 / 8,
        5 / 9,
        2 / 3
    ], o = function o(o, e) {
        return function(r) {
            var s = 4 * o + r - 4, n = "*-04-39?2$%%$%%'$%''%'''%')(%'))%(++'(++'(+.'+-.',/3',33)-/5)-43).36)058*18<+37<+4:<,4:E,5<A-7>C/8@F/:EH/<EK0=FM1?IP2@KS3BNV4DPY5FS\\6HV_6IXb7K[e8N^i9Pam;Rdp<Tgt".charCodeAt(s) - 35, f = s > 8 ? n : 1, c = e / f | 0, i = e % f, l = f - i, a = s > 8 ? c * t[r] + (o > 5) & -2 : n, _ = c - a;
            return {
                t: l * _ + i * _ + i,
                o: [
                    [
                        l,
                        _
                    ],
                    [
                        i,
                        _ + 1
                    ]
                ],
                i: a
            };
        };
    }, e = function e(t) {
        return new Uint8Array(t);
    }, r = function r(t) {
        var o = new Error("lean-qr error ".concat(t));
        throw o.code = t, o;
    }, s = function s(t) {
        return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".indexOf(t);
    }, n = function n(t) {
        return t.charCodeAt(0);
    }, f = function f() {
        for(var _len = arguments.length, t = new Array(_len), _key = 0; _key < _len; _key++){
            t[_key] = arguments[_key];
        }
        return function(o, e) {
            return t.forEach(function(t) {
                return t(o, e);
            });
        };
    }, c = function c(t) {
        return function(o) {
            o.eci !== t && (o.push(7, 4), t < 128 ? o.push(t, 8) : t < 16384 ? o.push(32768 | t, 16) : o.push(12582912 | t, 24), o.eci = t);
        };
    }, i = function i(t) {
        return function(o, e) {
            o.push(4, 4), o.push(t.length, 8 + 8 * (e > 9)), t.forEach(function(t) {
                return o.push(t, 8);
            });
        };
    }, l = function l(t, o, e, r) {
        var s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : function(t, o) {
            return e(t.length, o);
        }, n = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : r ? function(o) {
            return f(c(r), t(o));
        } : t;
        return n.test = o, n.l = e, n.est = s, n.eci = r && [
            r
        ], n;
    }, a = l(function(t) {
        return function(o, e) {
            o.push(1, 4), o.push(t.length, 10 + 2 * (e > 26) + 2 * (e > 9));
            var r = 0;
            for(; r < t.length - 2; r += 3)o.push(+t.slice(r, r + 3), 10);
            r < t.length - 1 ? o.push(+t.slice(r), 7) : r < t.length && o.push(+t[r], 4);
        };
    }, function(t) {
        return /[0-9]/.test(t);
    }, function(t, o) {
        return 14 + 2 * (o > 26) + 2 * (o > 9) + 10 * t / 3;
    }), _ = l(function(t) {
        return function(o, e) {
            o.push(2, 4), o.push(t.length, 9 + 2 * (e > 26) + 2 * (e > 9));
            var r = 0;
            for(; r < t.length - 1; r += 2)o.push(45 * s(t[r]) + s(t[r + 1]), 11);
            r < t.length && o.push(s(t[r]), 6);
        };
    }, function(t) {
        return s(t) >= 0;
    }, function(t, o) {
        return 13 + 2 * (o > 26) + 2 * (o > 9) + 5.5 * t;
    }), u = l(function(t) {
        return i(_to_consumable_array(t).map(n));
    }, function(t) {
        return n(t) < 128;
    }, function(t, o) {
        return 12 + 8 * (o > 9) + 8 * t;
    });
    u._ = !0, u.u = !0;
    var d = l(u, function(t) {
        return n(t) < 256;
    }, u.l, 3);
    d._ = !0;
    var p = new TextEncoder, m = l(function(t) {
        return i(p.encode(t));
    }, function() {
        return 1;
    }, 0, 26, function(t, o) {
        return 12 + 8 * (o > 9) + 8 * p.encode(t).length;
    });
    m._ = !0;
    var h = function h1() {
        var t = new Map, o = new TextDecoder("sjis"), r = e(2);
        for(var e1 = 0; e1 < 7973; ++e1)r[0] = e1 / 192 + 129 + 64 * (e1 > 5951), r[1] = e1 % 192 + 64, t.set(o.decode(r), e1);
        return t.delete("\ufffd"), h = function h() {
            return t;
        }, t;
    };
    var w = l(function(t) {
        return function(o, e) {
            o.push(8, 4), o.push(t.length, 8 + 2 * (e > 26) + 2 * (e > 9));
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                for(var _iterator = t[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var _$e = _step.value;
                    o.push(h().get(_$e), 13);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        };
    }, function(t) {
        return h().has(t);
    }, function(t, o) {
        return 12 + 2 * (o > 26) + 2 * (o > 9) + 13 * t;
    });
    w._ = !0;
    var y = [
        a,
        _,
        u,
        d,
        w,
        m
    ], g = {
        auto: function auto(t) {
            var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, tmp = _ref.modes, o = tmp === void 0 ? y : tmp;
            return function(e, s) {
                var n = o.map(function(o, e) {
                    var r = new Map, n = function n(t, o) {
                        return r.has(t) || r.set(t, o(t, s)), r.get(t);
                    };
                    return {
                        m: o,
                        h: 1 << e,
                        C: o.est("", s),
                        S: o.l ? function(t, e) {
                            return n(e - t, o.l);
                        } : function(e, r) {
                            return n(t.slice(e, r), o.est);
                        }
                    };
                });
                var f = [
                    {
                        v: 0
                    }
                ], c = 0, i = 0, l = -1;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = _to_consumable_array(t).concat([
                        ""
                    ])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var o1 = _step.value;
                        var _$t = 0;
                        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                        if (o1) try {
                            for(var _iterator1 = n[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                var e1 = _step1.value;
                                e1.m.test(o1) && (_$t |= e1.h);
                            }
                        } catch (err) {
                            _didIteratorError1 = true;
                            _iteratorError1 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                    _iterator1.return();
                                }
                            } finally{
                                if (_didIteratorError1) {
                                    throw _iteratorError1;
                                }
                            }
                        }
                        if (!o1 || _$t !== l) {
                            if (-1 !== l) {
                                var _$t1 = new Set(f.map(function(t) {
                                    return t.D;
                                })), o2 = [];
                                var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
                                try {
                                    for(var _iterator2 = n[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                                        var _step_value = _step2.value, e2 = _step_value.m, r1 = _step_value.C, s1 = _step_value.S, a = _step_value.h;
                                        if (l & a) {
                                            var _e_eci;
                                            var n1 = s1(c, i);
                                            var _iteratorNormalCompletion3 = true, _didIteratorError3 = false, _iteratorError3 = undefined;
                                            try {
                                                for(var _iterator3 = ((_e_eci = e2.eci) !== null && _e_eci !== void 0 ? _e_eci : _$t1)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
                                                    var l1 = _step3.value;
                                                    if (!e2.u || !l1) {
                                                        var _$t2 = void 0;
                                                        var _iteratorNormalCompletion4 = true, _didIteratorError4 = false, _iteratorError4 = undefined;
                                                        try {
                                                            for(var _iterator4 = f[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true){
                                                                var o3 = _step4.value;
                                                                if (o3.D === l1 || e2.eci) {
                                                                    var f1 = o3.m === e2 && o3.D === l1, a1 = f1 ? o3.V : o3, _ = e2._ && f1 ? o3.v + n1 - r1 : a1.v + 12 * (a1.D !== l1) + (f1 ? s1(f1 ? o3.$ : c, i) : n1);
                                                                    (!_$t2 || _ < _$t2.v) && (_$t2 = {
                                                                        $: f1 ? o3.$ : c,
                                                                        V: a1,
                                                                        m: e2,
                                                                        D: l1,
                                                                        A: i,
                                                                        v: _
                                                                    });
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError4 = true;
                                                            _iteratorError4 = err;
                                                        } finally{
                                                            try {
                                                                if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                                                                    _iterator4.return();
                                                                }
                                                            } finally{
                                                                if (_didIteratorError4) {
                                                                    throw _iteratorError4;
                                                                }
                                                            }
                                                        }
                                                        _$t2 && o2.push(_$t2);
                                                    }
                                                }
                                            } catch (err) {
                                                _didIteratorError3 = true;
                                                _iteratorError3 = err;
                                            } finally{
                                                try {
                                                    if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                                                        _iterator3.return();
                                                    }
                                                } finally{
                                                    if (_didIteratorError3) {
                                                        throw _iteratorError3;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally{
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                                            _iterator2.return();
                                        }
                                    } finally{
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }
                                f = o2;
                            }
                            l = _$t, c = i;
                        }
                        i += o1.length;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                f.length || r(5);
                var a2 = [];
                for(var o4 = f.reduce(function(t, o) {
                    return o.v < t.v ? o : t;
                }); o4.m; o4 = o4.V)a2.push(o4.m(t.slice(o4.$, o4.A)));
                a2.reverse().forEach(function(t) {
                    return t(e, s);
                });
            };
        },
        multi: f,
        eci: c,
        bytes: i,
        numeric: a,
        alphaNumeric: _,
        ascii: u,
        iso8859_1: d,
        shift_jis: w,
        utf8: m
    }, x = function x() {
        return {
            F: e(2956),
            I: 0,
            push: function push(t, o) {
                for(var e = o, r = 8 - (7 & this.I); e > 0; e -= r, r = 8)this.F[this.I >> 3] |= t << r >> e, this.I += e < r ? e : r;
            }
        };
    }, b = function b(t) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : t * t, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : e(o);
        return {
            size: t,
            K: r,
            get: function get(o, e) {
                return o >= 0 && o < t && !!(1 & r[e * t + o]);
            },
            toString: function toString() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, tmp = _ref.on, o = tmp === void 0 ? "##" : tmp, tmp1 = _ref.off, e = tmp1 === void 0 ? "  " : tmp1, tmp2 = _ref.lf, r = tmp2 === void 0 ? "\n" : tmp2, tmp3 = _ref.pad, s = tmp3 === void 0 ? 4 : tmp3, tmp4 = _ref.padX, n = tmp4 === void 0 ? s : tmp4, tmp5 = _ref.padY, f = tmp5 === void 0 ? s : tmp5;
                var c = "";
                for(var s1 = -f; s1 < t + f; ++s1){
                    for(var r1 = -n; r1 < t + n; ++r1)c += this.get(r1, s1) ? o : e;
                    c += r;
                }
                return c;
            },
            toImageData: function toImageData(o) {
                var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, tmp = _ref.on, e = tmp === void 0 ? [
                    0,
                    0,
                    0
                ] : tmp, tmp1 = _ref.off, r = tmp1 === void 0 ? [
                    0,
                    0,
                    0,
                    0
                ] : tmp1, tmp2 = _ref.pad, s = tmp2 === void 0 ? 4 : tmp2, tmp3 = _ref.padX, n = tmp3 === void 0 ? s : tmp3, tmp4 = _ref.padY, f = tmp4 === void 0 ? s : tmp4;
                var c = t + 2 * n, i = t + 2 * f, l = o.createImageData(c, i), a = new Uint32Array(l.data.buffer);
                l.data.set(_to_consumable_array(e).concat([
                    255
                ]));
                var _ = a[0];
                l.data.set(_to_consumable_array(r).concat([
                    255
                ]));
                var u = a[0];
                for(var _$t = 0; _$t < i; ++_$t)for(var _$o = 0; _$o < c; ++_$o)a[_$t * c + _$o] = this.get(_$o - n, _$t - f) ? _ : u;
                return l;
            },
            toCanvas: function toCanvas(t, o) {
                var e = t.getContext("2d"), r = this.toImageData(e, o);
                t.width = r.width, t.height = r.height, e.putImageData(r, 0, 0);
            },
            toDataURL: function toDataURL() {
                var _0 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                var _ref = [
                    _0
                ], _ref1 = _sliced_to_array(_ref, 1), tmp = _ref1[0], _ref2 = tmp === void 0 ? {} : tmp, tmp1 = _ref2.type, _$t = tmp1 === void 0 ? "image/png" : tmp1, tmp2 = _ref2.scale, o = tmp2 === void 0 ? 1 : tmp2, e = _object_without_properties(_ref2, [
                    "type",
                    "scale"
                ]);
                var r = document.createElement("canvas"), s = r.getContext("2d"), n = this.toImageData(s, e);
                return r.width = n.width * o, r.height = n.height * o, s.putImageData(n, 0, 0), s.imageSmoothingEnabled = !1, s.globalCompositeOperation = "copy", s.drawImage(r, 0, 0, n.width, n.height, 0, 0, r.width, r.height), r.toDataURL(_$t, 1);
            }
        };
    }, C = [
        function(t, o) {
            return 1 & (t ^ o);
        },
        function(t, o) {
            return 1 & o;
        },
        function(t) {
            return t % 3;
        },
        function(t, o) {
            return (t + o) % 3;
        },
        function(t, o) {
            return 1 & (t / 3 ^ o >> 1);
        },
        function(t, o) {
            return (t & o & 1) + t * o % 3;
        },
        function(t, o) {
            return (t & o) + t * o % 3 & 1;
        },
        function(t, o) {
            return (t ^ o) + t * o % 3 & 1;
        }
    ], z = e(511);
    for(var t1 = 0, o1 = 1; t1 < 255; o1 = 2 * o1 ^ 285 * (o1 > 127))z[z[o1 + 255] = t1++] = o1;
    var E = function E(t) {
        return z[t % 255];
    }, M = function M(t) {
        return z[t + 255];
    }, S = function S(t, o) {
        var r = e(t.length + o.length - 1);
        for(var e1 = 0; e1 < t.length; ++e1)for(var s = 0; s < o.length; ++s)r[e1 + s] ^= E(t[e1] + o[s]);
        return r.map(M);
    }, v = function v(t, o) {
        var r = e(t.length + o.length - 1);
        r.set(t, 0);
        for(var e1 = 0; e1 < t.length; ++e1)if (r[e1]) {
            var _$t = M(r[e1]);
            for(var s = 0; s < o.length; ++s)r[e1 + s] ^= E(o[s] + _$t);
        }
        return r.slice(t.length);
    }, D = [
        [
            0
        ],
        [
            0,
            0
        ]
    ];
    for(var t2 = 1; t2 < 30; ++t2)D.push(S(D[t2], [
        0,
        t2
    ]));
    var L = function L(t, o) {
        var r = [
            [],
            []
        ];
        var s = 0, n = 0;
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = o.o[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var _step_value = _sliced_to_array(_step.value, 2), e1 = _step_value[0], f = _step_value[1];
                for(var c = 0; c < e1; ++c, s += f){
                    var e2 = t.slice(s, s + f);
                    r[0].push(e2), r[1].push(v(e2, D[o.i])), n += f + o.i;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
        var f1 = e(n);
        n = 0;
        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
        try {
            for(var _iterator1 = r[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                var _$t = _step1.value;
                for(var _$o = void 0, e3 = 0; n !== _$o; ++e3){
                    _$o = n;
                    var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
                    try {
                        for(var _iterator2 = _$t[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                            var _$o1 = _step2.value;
                            e3 < _$o1.length && (f1[n++] = _$o1[e3]);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                                _iterator2.return();
                            }
                        } finally{
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError1 = true;
            _iteratorError1 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                    _iterator1.return();
                }
            } finally{
                if (_didIteratorError1) {
                    throw _iteratorError1;
                }
            }
        }
        return f1;
    }, V = function V(t, o, e) {
        var r = t <<= e;
        for(var _$t = 134217728; _$t >>= 1;)r & _$t && (r ^= o * (_$t >> e));
        return r | t;
    }, $ = function $(param, e) {
        var t = param.size, o = param.K;
        var r = function r(e, r, s, n) {
            for(; s-- > 0; e += t)o.fill(n, e, e + r);
        }, s = function s(o, e, s) {
            for(var n = 0; n++ < 3; s -= 2)r(e * t + o - (s >> 1) * (t + 1), s, s, 2 | n);
        }, n = 2 * ((t - 13) / (1 + (e / 7 | 0)) / 2 + .75 | 0);
        if (e > 1) for(var o1 = t - 7; o1 > 8; o1 -= n){
            for(var t1 = o1; t1 > 8; t1 -= n)s(o1, t1, 5);
            o1 < t - 7 && s(o1, 6, 5);
        }
        if (e > 6) for(var r1 = V(e, 7973, 12), s1 = 1; s1 < 7; ++s1)for(var _$e = 12; _$e-- > 9; r1 >>= 1)o[s1 * t - _$e] = 2 | 1 & r1;
        r(7, 2, 9, 2), r(t - 8, 8, 9, 2);
        for(var _$e1 = 0; _$e1 < t; ++_$e1)o[6 * t + _$e1] = 3 ^ 1 & _$e1;
        s(3, 3, 7), s(t - 4, 3, 7);
        for(var _$e2 = 0; _$e2 < t; ++_$e2)for(var r2 = _$e2; r2 < t; ++r2)o[r2 * t + _$e2] = o[_$e2 * t + r2];
        o[(t - 8) * t + 8] = 3;
    }, A = function A(param) {
        var t = param.size, o = param.K;
        var e = [];
        for(var r = t - 2, s = t, n = -1; r >= 0; r -= 2){
            for(5 === r && (r = 4); s += n, -1 !== s && s !== t;){
                var n1 = s * t + r;
                o[n1 + 1] || e.push(n1 + 1), o[n1] || e.push(n1);
            }
            n *= -1;
        }
        return e;
    }, F = function F(param, o, e) {
        var t = param.K;
        return o.forEach(function(o, r) {
            return t[o] = e[r >> 3] >> (7 & ~r) & 1;
        });
    }, H = function H(param, e, r, s) {
        var t = param.size, o = param.K;
        for(var _$r = 0; _$r < t; ++_$r)for(var _$s = 0; _$s < t; ++_$s){
            var n = _$r * t + _$s;
            o[n] ^= !(e(_$s, _$r) || 2 & o[n]);
        }
        var n1 = 21522 ^ V((1 ^ s) << 3 | r, 1335, 10);
        for(var _$e = 0; _$e++ < 8; n1 >>= 1)o[(_$e - (_$e < 7)) * t + 8] = 1 & n1, o[9 * t - _$e] = 1 & n1;
        for(var _$e1 = 8; --_$e1, n1; n1 >>= 1)o[8 * t + _$e1 - (_$e1 < 7)] = 1 & n1, o[(t - _$e1) * t + 8] = 1 & n1;
    }, I = function I(param) {
        var t = param.size, o = param.K, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
        for(var s = 0; s < t; ++s){
            for(var n = 0; n < 2; ++n)for(var f = void 0, c = 0, i = 0, l = 0; c < t; ++c){
                var a = 1 & o[n ? s * t + c : c * t + s];
                r += a, i = (i >> 1 | 2098176) & (3047517 ^ a - 1), 2049 & i && (e += 40), a !== f && (l = 0), f = a, e += 5 === ++l ? 3 : l > 5;
            }
            if (s) for(var r1 = t + s, n1 = 5 * o[s - 1] ^ o[s]; r1 < t * t; r1 += t){
                var t1 = 5 * o[r1 - 1] ^ o[r1];
                e += 3 * !(1 & (n1 | t1) | 4 & (n1 ^ t1)), n1 = t1;
            }
        }
        return e + 10 * (10 * Math.abs(r / (t * t) - 1) | 0);
    }, K = [], N = function N() {
        var _0 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0, _1 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
        var _ref = [
            _0,
            _1
        ], _ref1 = _to_array(_ref), tmp = _ref1[0], t = tmp === void 0 ? r(1) : tmp, _rest = _ref1.slice(1), _rest1 = _sliced_to_array(_rest, 1), tmp1 = _rest1[0], _ref2 = tmp1 === void 0 ? {} : tmp1, tmp2 = _ref2.minCorrectionLevel, e = tmp2 === void 0 ? 0 : tmp2, tmp3 = _ref2.maxCorrectionLevel, s = tmp3 === void 0 ? 3 : tmp3, tmp4 = _ref2.minVersion, n = tmp4 === void 0 ? 1 : tmp4, tmp5 = _ref2.maxVersion, f = tmp5 === void 0 ? 40 : tmp5, c = _ref2.mask, tmp6 = _ref2.trailer, i = tmp6 === void 0 ? 60433 : tmp6, l = _object_without_properties(_ref2, [
            "minCorrectionLevel",
            "maxCorrectionLevel",
            "minVersion",
            "maxVersion",
            "mask",
            "trailer"
        ]);
        s < e && r(3), f < n && r(2), "string" == typeof t && (t = g.auto(t, l));
        for(var r1 = n, l1 = 0; r1 <= f; ++r1){
            var _loop = function(t1) {
                var o = f1(t1);
                if (8 * o.t < l1) return "continue";
                for(a.I = l1 + 11 & -8; a.I < 8 * o.t;)a.push(i, 16);
                var e = b(n1.size, n1.K);
                return {
                    v: (F(e, n1.p, L(a.F, o)), (C[c !== null && c !== void 0 ? c : -1] ? [
                        C[c]
                    ] : C).map(function(o, r) {
                        var s = b(e.size, e.K);
                        return H(s, o, c !== null && c !== void 0 ? c : r, t1), s.s = I(s), s;
                    }).reduce(function(t, o) {
                        return o.s < t.s ? o : t;
                    }))
                };
            };
            var n1 = K[r1];
            n1 || (K[r1] = n1 = b(4 * r1 + 17), $(n1, r1), n1.p = A(n1));
            var f1 = o(r1, n1.p.length >> 3);
            if (8 * f1(e).t < l1) continue;
            var a = x();
            t(a, r1), l1 = a.I;
            for(var t1 = s; t1 >= e; --t1){
                var _ret = _loop(t1);
                if (_type_of(_ret) === "object") return _ret.v;
            }
        }
        r(4);
    };
    N.with = function() {
        for(var _len = arguments.length, t = new Array(_len), _key = 0; _key < _len; _key++){
            t[_key] = arguments[_key];
        }
        return function(o, e) {
            return N(o, _object_spread({
                modes: _to_consumable_array(y).concat(_to_consumable_array(t))
            }, e));
        };
    };
    return {
        correction: {
            min: 0,
            L: 0,
            M: 1,
            Q: 2,
            H: 3,
            max: 3
        },
        generate: N,
        mode: g
    };
}();
