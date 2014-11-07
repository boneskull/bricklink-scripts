// ==UserScript==
// @name         Bricklink - Wanted List: Auto-View Image
// @namespace    badwing
// @homepage     https://github.com/boneskull/bricklink-scripts
// @version      0.1
// @description  Automatically views the image when adding an item to your wanted list.
// @author       Christopher Hiller
// @include      http://www.bricklink.com/wantedAddDetail.asp?*
// @require      //code.jquery.com/jquery-1.11.1.min.js
// @require      //cdnjs.cloudflare.com/ajax/libs/spin.js/2.0.1/jquery.spin.min.js
// ==/UserScript==

(function () {
  'use strict';

  var img_thumb,
    getImage;

  /**
   * Given an ID, put the image in the placeholder.
   * @param {string} id Part ID
   */
  getImage = function getImage(id) {
    var src = '/getPic.asp?itemType=P&itemNo=' + id;

    $.ajaxQueue(src).done(function (src) {
      return function () {
        img_thumb.attr('src', src);
      };
    }(src));
  };

  $(function () {
    var txt_itemId = $('input[name="p_selecteditemID"]'),
      val = txt_itemId.val(),
      anchor = $('<a href="#" title="Click to Refresh"></a>')
        .click(function () {
          getImage(txt_itemId.val());
        });

    img_thumb = $('img[name="img1"]');

    // remove error handler; no longer necessary
    // wrap in anchor and bind the click event to refresh.
    img_thumb.removeAttr('onerror')
      .wrap(anchor);

    if (val) {
      getImage(val);
    }

    // update the img as the user types
    txt_itemId.keyup(function () {
      var val = this.value;
      if (val) {
        getImage(this.value);
      }
    });

    // hide unneccessary garbage
    $('input[name="imageType"]').next().css('visibility', 'hidden');
  });


})();
