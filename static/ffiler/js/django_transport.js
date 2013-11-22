;
(function ($) {

    $.fn['ffiler_django'] = function (options) {
        var targets = []
        var options = options
        var id = '#id_' + options.prefix + '-TOTAL_FORMS'
        var total_forms_desc = $(id).hide()
        var django_jquery_object = django.jQuery('#' + $(this).attr('id'))
        var orig_targets = $(this).find('p.file-upload a')
        orig_targets.each(function () {
            targets.push($(this).attr('href'))
        })
        $(this).find('*').hide()
        var that = this
        options = {
            'targets': targets,
            'ffiler_upload_url': '/admin/django_ffiler/upload/',
            'callback_add_item': function (img_w, is_new, url) {
                if (!is_new) {

                    img_w.data('django_row', that.find('p a[href="' + url + '"]').parents('.inline-related').attr('id'))
                    return;
                }
                django_jquery_object.find('.add-row a').hide().trigger('click')
                img_w.data('django_row', django_jquery_object.find('.inline-related').last().prev().attr('id'))
            },

            'callback_remove_item': function (object) {
                var django_row = django.jQuery('#' + object.data('django_row'))
                var jquery_row = jQuery('#' + object.data('django_row'))

                if (!django_row || !django_row.length) {

                    return;
                }
                django_row.find('.inline-deletelink').trigger('click')
                jquery_row.find("input[name$='DELETE']").attr('checked', 'checked')
            },
            'callback_preupload': function (options, ffiler_object) {
                var token = that.parents('form').find('input[name="csrfmiddlewaretoken"]').val()
                options['data'].append('csrfmiddlewaretoken', token)
            },
            'callback_postupload': function (res, ffiler_object) {
                var row = $('#' + ffiler_object.data('django_row'))
                row.append('<input type="hidden" value="' + res + '" name="' + ffiler_object.data('django_row') + '-url"/>')
            },
            'func_make_thumbnail_url': function (url) {
                return '/admin/django_ffiler/crop' + url
            }
        }
        var filler = $(this).ffiler(options)

    };

})(jQuery);