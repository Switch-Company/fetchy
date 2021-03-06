/**
 * @switch-company/fetcher - Wrap the Fetch API with convenience methods.
 * @version v2.0.2
 * @link https://www.npmjs.com/package/@switch-company/fetcher
 * @license ISC
 **/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.fetcher = factory());
}(this, (function () { 'use strict';

  var config = {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    params: {
      credentials: 'same-origin'
    },
    timeout: 30000
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  /**
   * create a custom response object based on the fetch response object
   * @param {*} data - data parsed by the pass method
   * @param {object} response - fetch response object
   * @return {object} custom response object
   */
  function createResponse(data, response) {
    var ok = response.ok,
        redirected = response.redirected,
        status = response.status,
        statusText = response.statusText,
        type = response.type,
        url = response.url;

    var headers = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = response.headers.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref = _step.value;

        var _ref2 = slicedToArray(_ref, 2);

        var name = _ref2[0];
        var value = _ref2[1];

        headers[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      headers: headers,
      ok: ok,
      redirected: redirected,
      status: status,
      statusText: statusText,
      type: type,
      url: url,
      data: data
    };
  }

  /**
   * do the fetch call
   * @param {string} url - url to fetch
   * @param {object} params - fetch paramerters object
   * @param {object} options - one time configuration of the fetch request
   * @return {Promise} Promise object containing the formated response
   */
  function fetch(url) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    // merge params
    params = Object.assign({}, config.params, params);

    if (!params.headers) {
      params.headers = {};
    }

    // merge headers
    params.headers = Object.assign({}, config.headers, params.headers);

    // create a promise that can be rejected by the timeout
    return new Promise(function (resolve, reject) {
      var rejected = false;
      // fail when theres a timeout or not internet connection
      var browserReject = function browserReject(error) {
        rejected = true;

        reject({
          status: error ? 0 : 599,
          statusText: error ? error.message : 'Network Connect Timeout Error',
          url: url
        });
      };

      var timeout = window.setTimeout(browserReject, options.timeout || config.timeout);

      // fetch the url and resolve or reject the current promise based on its resolution
      window.fetch(url, params).then(function (res) {
        if (rejected) {
          return;
        }

        resolve(res);
      }).catch(browserReject).then(function () {
        window.clearTimeout(timeout);
      });
    })
    // check validity of the response
    .then(function (response) {
      return pass(response, params, options.parse);
    });
  }

  /**
   * check respone allow the use of `then` and `catch` based on the value of the success key
   * @param {object} response - fetch response object
   * @param {object} params - param object used to trigger the call
   * @return {Promise} Promise object containing the formated response
   */
  function pass(response, params) {
    var shouldParse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!shouldParse) {
      return response;
    }

    var contentType = response.headers.get('content-type');
    var parsing = void 0;

    if (contentType) {
      contentType = contentType.split(';')[0];
    }

    switch (contentType) {
      case 'application/json':
        parsing = response.json();
        break;
      case 'multipart/form-data':
        parsing = response.formData();
        break;
      case 'application/octet-stream':
        parsing = response.blob();
        break;
      default:
        parsing = response.text();
    }

    return parsing.then(function (data) {
      var formatedResponse = createResponse(data, response);

      if (!response.ok) {
        return Promise.reject(formatedResponse);
      }

      return formatedResponse;
    });
  }

  var escape = window.encodeURIComponent;

  function queryfy(params) {
    return Object.keys(params).map(function (key) {
      if (Array.isArray(params[key])) {
        return params[key].map(function (value) {
          return escape(key) + '=' + escape(value);
        }).join('&');
      }

      return escape(key) + '=' + escape(params[key]);
    }).join('&');
  }

  /**
   * GET
   * @param {string} url -the url to fetch
   * @param {object} params - the fetch API param object
   * @param {object} options - one time configuration of the fetch request
   * @return {promise} the fetch promise
   */
  function get$1(url) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


    params.method = 'get';

    if (params.data) {
      var search = url.split('?')[1];

      if (search) {
        url += '&' + queryfy(params.data);
      } else {
        url += '?' + queryfy(params.data);
      }

      delete params.data;
    }

    return fetch(url, params, options);
  }

  /**
   * SEND
   * @param {string} url -the url to fetch
   * @param {object} params - the fetch API param object
   * @param {object} options - one time configuration of the fetch request
   * @return {promise} the fetch promise
   */
  function send(url) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    // const multipart = params.headers && params.headers[ 'Content-Type' ] && params.headers[ 'Content-Type' ].toLowerCase().indexOf( 'multipart/form-data' ) > -1;

    var currentContentType = void 0;
    var format = true;

    if (params.headers) {
      Object.keys(params.headers).some(function (header) {
        var headerName = header.toLowerCase();

        if (headerName !== 'content-type') {
          return;
        }

        currentContentType = params.headers[header].toLowerCase().split(';')[0];

        // multipart = contentType === 'multipart/form-data';
        // json = contentType === 'application/json';

        return true;
      });
    } else {
      params.headers = {};
    }

    if (currentContentType === 'multipart/form-data' || currentContentType === 'application/octet-stream') {
      format = false;
    }

    if (format && params.data) {
      if ('append' in params.data.__proto__ || 'type' in params.data.__proto__) {
        format = false;

        if (params.data.type && !currentContentType) {
          params.headers['content-type'] = params.data.type;
        }
      } else if (!currentContentType && _typeof(params.data) === 'object') {
        params.headers['content-type'] = 'application/json;charset=UTF-8';
      }
    }

    // merge params
    params = Object.assign({}, {
      // default to post
      method: 'post'
    }, params);

    if (params.data) {
      // stringify the JSON data if the data is not multipart
      params.body = format ? JSON.stringify(params.data) : params.data;
      delete params.data;
    }

    return fetch(url, params, options);
  }

  function toJSON(form) {
    var stringOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var data = new FormData(form);
    var json = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref = _step.value;

        var _ref2 = slicedToArray(_ref, 2);

        var name = _ref2[0];
        var value = _ref2[1];


        if (stringOnly && typeof value !== 'string') {
          continue;
        }

        // don't store empty file inputs
        if (value.constructor.name === 'File' && value.size === 0) {
          continue;
        }

        if (json[name]) {
          // push the value
          if (Array.isArray(json[name])) {
            json[name].push(value);

            continue;
          }

          // transform into an array
          json[name] = [json[name], value];

          continue;
        }

        // create pair
        json[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return json;
  }

  var escape$1 = window.encodeURIComponent;

  function toQuery(form) {
    var params = toJSON(form, true);

    return Object.keys(params).map(function (key) {
      if (Array.isArray(params[key])) {
        return params[key].map(function (value) {
          return escape$1(key) + '=' + escape$1(value);
        }).join('&');
      }

      return escape$1(key) + '=' + escape$1(params[key]);
    }).join('&');
  }

  function hasFile(form) {
    var elements = Array.from(form.elements);

    return elements.some(function (element) {
      return element.type === 'file' && element.files.length > 0;
    });
  }

  var formUtils = { toJSON: toJSON, toQuery: toQuery, hasFile: hasFile };

  /**
   * Get the form data and use fetch based on the action and method attributes
   * @param {HTMLFormElement} form - the form to submit asynchronously
   * @param {object} params - the fetch API param object
   * @param {object} options - one time configuration of the fetch request
   * @return {Promise} Promise object containing the formated response
   */
  function form(form) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var callMethod = send;
    var contentType = form.enctype;

    if (!params.header) {
      params.header = {};
    }

    if (form.method && !params.method) {
      params.method = form.method;
    }

    if (contentType && !params.header['Content-Type']) {
      params.header['Content-Type'] = contentType;
    }

    if (params.method === 'get') {
      callMethod = get$1;
    }

    if (formUtils.hasFile(form)) {
      if (!params.header) {
        params.header = {};
      }

      params.header['Content-Type'] = 'multipart/form-data';

      params.data = new FormData(form);
    } else {
      params.data = formUtils.toJSON(form);
    }

    return callMethod(form.action, params, options);
  }

  var index = { get: get$1, send: send, form: form, config: config };

  return index;

})));
