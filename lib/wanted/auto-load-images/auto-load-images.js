(function () {
  'use strict';

  var img_thumb,
    getImage,
    getUrlParam;

  /**
   * Given a Location object oTarget, parse the value of a particular parameter
   * of its search string.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Location
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search
   * @param {Location} oTarget Location object
   * @param {string} sVar String to parse
   * @returns {string}
   */
  getUrlParam = function getURLParam(oTarget, sVar) {
    return decodeURI(oTarget.search.replace(new RegExp('^(?:.*[&\\?]' +
    encodeURI(sVar).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'),
      '$1'));
  };

  /**
   * Given an ID, put the image in the placeholder.
   * @param {string} id Part ID
   */
  getImage = function getImage(id) {
    var item_type = getUrlParam(window.location, 'a'),
      src = '/getPic.asp?itemType=' + item_type + '&itemNo=' + id;

    $.getq(src).done(function (src) {
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

    // if we already have a value, get the image for it
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
