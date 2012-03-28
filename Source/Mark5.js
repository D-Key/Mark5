// Mark5 is a Google Chrome extension that makes markdown reading nice and simple.
// (c) 2012 Dmitriy Komarov
//
var mark5 = window.mark5 = {
    _originalHtml: null,
    _originalText: null,
    _injectHtml: null,
    _baseUrl: 'chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/',
    _storageKeyTheme: 'mark5.theme',
    _storageKeyScale: 'mark5.scale',

    initialize: function () {
        $.get(mark5._baseUrl + 'template.html', function (data) {
            var template = $(data.replace(/ src="/g, ' src="' + mark5._baseUrl));
            var inject = template.filter('#mark5_inject');
            mark5._injectHtml = inject.clone().wrap('<div>').parent().html();
        });

        mark5.renderMarkdown();
    },

    getValue: function (key, callback) {
        chrome.extension.sendRequest({ key: key }, function (r) { callback(r.value); });
    },

    setValue: function (key, value) {
        if (value) chrome.extension.sendRequest({ key: key, value: value }, function () { });
        else chrome.extension.sendRequest({ key: key, action: 'remove' }, function () { });
    },

    openExtensions: function () {
        chrome.extension.sendRequest({ action: 'options-extensions' }, function () { });
    },

    renderMarkdown: function () {
        var o = $('html');
        if (!mark5._originalHtml) {
            mark5._originalHtml = o.html();
            mark5._originalText = $(document).text();
            var converter = new Markdown.Converter();
            o.delay(300).fadeOut(200, function () {
                o.html('<div id="mark5_overlay">' + converter.makeHtml(mark5._originalText) + '</div>' + mark5._injectHtml);
                mark5.updateFootnotes();
                $('#mark5_action_back').click(function () { mark5.restoreHtml(); return false; });
                $('#mark5_action_config').click(function () { mark5.configure(); return false; });
                $('#mark5_action_about').click(function () { mark5.openMD('about.md'); return false; });
                $('.mark5_popup').mouseleave(function () { $(this).css('display', 'none').attr('used', false); });
                $('.mark5_popup').mouseenter(function () { $(this).attr('used', true); });
                $(window).keydown(function (e) {
                    if (e.which == 27) { $('#mark5_action_back').click(); }
                    mark5.closePopups(true);
                }).mousedown(function () {
                    mark5.closePopups(true);
                });
                $('#mark5_theme_0').click(function () { mark5.setTheme(); return false; });
                $('#mark5_theme_1').click(function () { mark5.setTheme('night'); return false; });
                $('#mark5_theme_2').click(function () { mark5.setTheme('sans'); return false; });
                $('#mark5_theme_3').click(function () { mark5.setTheme('hack'); return false; });
                $('#mark5_scale0').click(function () { mark5.setScale('70%'); return false; });
                $('#mark5_scale1').click(function () { mark5.setScale('85%'); return false; });
                $('#mark5_scale2').click(function () { mark5.setScale('100%'); return false; });
                $('#mark5_scale3').click(function () { mark5.setScale('120%'); return false; });
                mark5.getValue(mark5._storageKeyTheme, function (v) { mark5.setTheme(v); });
                mark5.getValue(mark5._storageKeyScale, function (v) { mark5.setScale(v); });
            }).delay(300).fadeIn(200);
        }
    },

    updateFootnotes: function () {
        var n = $('#mark5_footnotes').html('').append('<h3>Links</h>');
        $('#mark5_overlay a').each(function () {
            n.append($(this).text() + ': ' + $(this).attr('href') + '<br/>');
        });
    },

    closePopups: function (onlyUnused) {
        $('.mark5_popup').each(function () { var t = $(this); if (!onlyUnused || !(t.attr('used'))) t.css('display', 'none'); });
    },

    openMD: function (resourceUrl) {
        var url = mark5._baseUrl + resourceUrl;
        var converter = new Markdown.Converter();
        $.get(url, function (data) {
            var dataDecoded = data.replace(/chrome-extension:\/\/@@extension_id@@\//g, mark5._baseUrl);
            $('#mark5_overlay').html(converter.makeHtml(dataDecoded));
            mark5.updateFootnotes();
            $('#mark5_action_back').off('click').click(function () { mark5.closeMD(); return false; }).attr('title', 'Back to the text');
            $('#mark5_extensions').click(function () { mark5.openExtensions(); return false; });
        });
    },

    closeMD: function () {
        var converter = new Markdown.Converter();
        $('#mark5_overlay').html(converter.makeHtml(mark5._originalText));
        $('#mark5_action_back').off('click').click(function () { mark5.restoreHtml(); return false; }).attr('title', 'Show original text'); ;
    },

    restoreHtml: function () {
        if (mark5._originalHtml) {
            $('html').html(mark5._originalHtml);
            mark5._originalHtml = null;
        }
    },

    refreshMarkdown: function () {
        mark5.restore();
        mark5.renderMarkdown();
    },

    showPopup: function (id) {
        var d = $(id);
        var display = d.css('display');
        mark5.closePopups(false);
        if (display == 'none') d.css('display', 'block');
    },

    configure: function () {
        mark5.showPopup('#mark5_view_settings');
    },

    setTheme: function (themeName) {
        $('body').removeClass();
        if (themeName) $('body').addClass(themeName);
        mark5.setValue(mark5._storageKeyTheme, themeName);
    },

    setScale: function (sScalePercent) {
        if (sScalePercent) $('body').css('font-size', sScalePercent);
        mark5.setValue(mark5._storageKeyScale, sScalePercent);
    }
};

$(document).ready(function () {
    mark5.initialize();
});
