// ==UserScript==
// @name        BrickLink - Wanted List: Automatically Load Images
// @namespace   org.badwing
// @homepage    https://github.com/boneskull/bricklink-scripts
// @version     0.1.2
// @description Automatically load images when adding items to wanted list
// @author      Christopher Hiller <chiller@badwing.com>
// @downloadURL https://raw.githubusercontent.com/boneskull/bricklink-scripts/master/dist/auto-load-images.user.js
// @updateURL   https://raw.githubusercontent.com/boneskull/bricklink-scripts/master/dist/auto-load-images.meta.js
// @include     http://www.bricklink.com/wantedAddDetail.asp?*
// @require     http://code.jquery.com/jquery-1.11.1.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/spin.js/2.0.1/spin.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/spin.js/2.0.1/jquery.spin.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js
// @require     https://greasyfork.org/scripts/6649-transparency/code/transparency.js?version=25968
// @resource    template https://raw.githubusercontent.com/boneskull/bricklink-scripts/master/dist/auto-load-images.html
// @license     MIT
// @grant       GM_getResourceText
// ==/UserScript==

(function () {
  'use strict';

  var init,
    success,
    fail,
    getImage,
    getUrlParam,
    autoLoadImages,
    render,

    /**
     * Spinner configuration for spin.js
     * @type {Object}
     */
    spinner_opts = {
      lines: 7, // The number of lines to draw
      length: 0, // The length of each line
      width: 5, // The line thickness
      radius: 4, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#00F', // #rgb or #rrggbb or array of colors
      speed: 2.0, // Rounds per second
      trail: 40, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: true, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '60px', // Top position relative to parent
      left: '15px' // Left position relative to parent
    },

    /**
     * Current image request
     * @type {jqXHR}
     */
    req,

    /**
     * Abbreviation for current item type
     * @type {string}
     */
    item_type,

    /**
     * Image thumbnail
     * @type {jQuery}
     */
    img_thumb,

    /**
     * <td> to right of thumb
     * @type {jQuery}
     */
    td_container,

    /**
     * Progress spinner wrapper
     * @type {jQuery}
     */
    div_spinner,

    /**
     * Item id text input box
     * @type {jQuery}
     */
    input_itemId;

  /**
   * Renders container template
   * @param {Object} data As specified by Transparency
   * @see http://leonidas.github.io/transparency
   */
  render = function render(data, directives) {
    autoLoadImages.render({
      auto_load_images: data
    }, directives || {});
  };

  /**
   * Displays failure message
   * @param {string} id Item id
   */
  fail = function fail(id) {
    render({
      status: {
        error: {
          item: id
        }
      }
    });
  };

  /**
   * Displays success message
   * @param {string} id Item id
   */
  success = function success(id) {
    render({
      info: {
        now_showing: {
          id: id,
          item_type: item_type
        }
      },
      status: {
        ok: 'OK'
      }
    }, success.directives);
  };
  success.directives = {
    now_showing: {
      href: function () {
        return '/catalogItem.asp?' + this.item_type + '=' + this.id;
      },
      text: function (params) {
        return this.id + params.value;
      }
    }
  };

  /**
   * Given a Location object `oTarget`, parse the value of a particular
   * parameter of its search string.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Location
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search
   * @param {Location} oTarget Location object
   * @param {string} sVar String to parse
   * @returns {string}
   */
  getUrlParam = function getURLParam(oTarget, sVar) {
    return decodeURI(oTarget.search.replace(new RegExp('^(?:.*[&\\?]' +
        encodeURI(sVar).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$',
        'i'),
      '$1'));
  };

  /**
   * Given an ID, put the image in the placeholder.
   * @param {string} id Part ID
   */
  getImage = function getImage(id) {
    var url;
    if (id) {
      div_spinner = div_spinner || $('<div></div>')
        .appendTo(td_container)
        .spin(spinner_opts);
      div_spinner.show();

      url = '/getPic.asp?itemType=' + item_type + '&itemNo=' + id;

      if (req) {
        req.abort();
      }
      req = $.get(url)
        .done((function (id, url) {
          return function () {
            success(id);
            return img_thumb.attr('src', url);
          };
        })(id, url))
        .fail((function (id) {
          return function () {
            return fail(id);
          };
        })(id))
        .always(function () {
          div_spinner.hide();
        });
    }
  };

  init = function init() {
    autoLoadImages = $(GM_getResourceText('template'));
    console.log(autoLoadImages);
    item_type = getUrlParam(window.location, 'a').toUpperCase();

    return function onready() {
      input_itemId = $('input[name="p_selecteditemID"]');

      // remove error handler; no longer necessary
      // wrap in anchor and bind the click event to refresh.
      img_thumb = $('img[name="img1"]')
        .removeAttr('onerror');

      // get the image for current value
      getImage(input_itemId.val());

      // update the img as the user types
      input_itemId.keyup($.debounce(250, function () {
        getImage(this.value);
      }));

      // empty the blurb and repurpose
      img_thumb.parents('table[width="100%"]:first')
        .removeAttr('width');
      td_container = $('input[name="imageType"]')
        .next()
        .empty()
        .append(autoLoadImages);

      render({
        status: {
          ready: 'Ready!'
        }
      });

    };
  };

  $(init());


})();
