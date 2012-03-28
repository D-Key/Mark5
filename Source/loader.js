(function () {
    var content = document.documentElement.innerHTML;
    var slice = content.slice(0, 300).toLowerCase();
    var isHtml = false;
    if (slice.indexOf('<meta') >= 0) isHtml = true;
    if (slice.indexOf('<title') >= 0) isHtml = true;
    if (slice.indexOf('<script') >= 0) isHtml = true;
    if (slice.indexOf('<pre') < 0) isHtml = true;

    if (!isHtml) {
        chrome.extension.sendRequest({ action: 'initialize' });
    }
})();
