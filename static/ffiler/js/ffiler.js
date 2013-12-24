;

(function ($) {
    "use strict";

    var pluginName = 'ffiler';

    var defaults = {
        ffiler_wrap: $('<div class="ffiler_dummy"><div class="ffiler_wrap"></div></div>'),
        ffiler_file_wrap: $('<a class="filler_img_wrap ffiler_img" data-lightbox="image-1"></a>'),
        ffiler_file: $('<div class="ffiler_file_wrap"><input type="file" name="ffiler_file" id="fffiler_file" multiple="true"/></div>'),
        ffiler_delete_btn: $('<div class="gallery_delete_btn"><button type="button" class="btn btn-danger btn-xs"><i class="glyphicon glyphicon-remove"></i></button></div>'),
        ffiler_mode: 'from_url',
        ffiler_upload_url: '',
        callback_preupload: false,
        callback_postupload: false,
        callback_sortupdate: false,
        callback_all_loaded: false,
        targets: false,
        rules: {
            2: [10, 150],
            4: [151, 299],
            6: [300, 499],
            8: [500, 599],
            10: [600, 699],
            12: [700, 799],
            14: [800, 899],
            16: [900, 999],
            20: [1000, 1000000]
        },
        func_make_thumbnail_url: function (url) {
            return url
        },
        callback_add_item: false,
        callback_remove_item: false,
        rule_default: 15
    };

    function Plugin(wrapper, options) {
        this.gl_wrapper = $(wrapper);

        this.options = $.extend({}, defaults, options);
        this.orig_targets = this.options.targets
        this.targets = false
        this._defaults = defaults;

//        var meta = this.$el.data(name + '-opts');
//        this.opts = $.extend(this._defaults, options, meta);


        this.init();
    }

    Plugin.prototype = {

        init: function () {
            var that = this
            this.dummy = this.options.ffiler_wrap.appendTo(this.gl_wrapper);
            this.wrapper = this.dummy.find('.ffiler_wrap')
            this.delete_button = this.options.ffiler_delete_btn.appendTo(this.gl_wrapper)
            this.file_object_wrapper = this.options.ffiler_file.prependTo(this.wrapper)
            this.file_object = this.file_object_wrapper.find('input[type="file"]')
            if (this.options.ffiler_mode == 'from_url') {
                for (var i in this.orig_targets) {
                    this.add_item(this.orig_targets[i], false)
                }
            }

            this.file_object.bind('change', function () {
                var loaded = 0
                var total = this.files.length
                var int = setInterval(function () {

                    if (loaded >= total) {
                        console.log('ALL UPLOADED')
                        that.remake()
                        that.resortable()
                        if (that.options.callback_all_loaded) {
                            that.options.callback_all_loaded.apply(that)
                        }
                        clearInterval(int)
                    }
                }, 100)

                $.each(this.files, function (i, file) {
                    if (!file.type.match(/image.*/)) {
                        loaded++
                        return true;
                    }


                    var reader = new FileReader();
                    var load = (function (that) {

                        return function (e) {
                            that.add_item(e.target.result, true, file)
                            loaded++
                        };
                    })(that);
                    reader.onload = load

                    reader.readAsDataURL(file);
                });
            })


//            this.targets = this.wrapper.find('.filler_img_wrap')
            this.remake()
            this.resortable()
            this.wrapper.magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: {
                    enabled: true
                }

            });
            $(window).resize(function () {
                that.remake()
            })

            this.wrapper.delegate('.filler_img_wrap img', 'mouseover', function () {
                var e = $(this)
                that.delete_button.css({
                    'top': $(this).position().top,
                    'left': $(this).position().left
                }).show('fast').data('elem', e.parent())
            })

            this.delete_button.on('click', {'ffiler': this}, function (event) {
                event.data.ffiler.remove_item($(this).data('elem'))
            })
        },

        get_file_object: function () {
            return this.file_object
        },

        get_optimal: function get_optimal(w) {
            for (var i in this.options.rules) {
                if (w >= this.options.rules[i][0] && w <= this.options.rules[i][1]) {
                    console.log('Gallery resize candidate:', i)
                    return i
                }
            }
            return this.options.rule_default
        },

        remake: function () {
            this.retarget()
            var f = this.targets.first()
            this.make(f, this.wrapper.outerWidth(false), this.get_optimal(this.wrapper.width(), f))
            this.targets.show()
        },

        /**
         * Research ffiler objects in the wrapper. Call if u dynamicly change ffiler objects
         *
         * @this {Plugin} ffiler object
         */
        retarget: function () {
            this.targets = this.wrapper.find('.filler_img_wrap')
        },

        resortable: function () {
            var that = this
            this.wrapper.sortable('destroy')
            this.wrapper.sortable({
                items: '.filler_img_wrap',
                forcePlaceholderSize: true
            }).bind('sortupdate', function () {
                    if (that.options.callback_sortupdate) {
                        that.options.callback_sortupdate.apply(that)
                    }
                })
            console.log(2)
        },
        /**
         * Add new item in ffiler.
         *
         * @param {string} url Url to object
         * @this {Plugin} ffiler object
         * @param {bool} is_new Set True if you dynamicly added object
         * @param {string} url
         * @see {ffiler.options.callback_add_item.apply called after adding object
         */
        add_item: function (url, is_new, file_data) {
            var reurl = is_new ? url : this.options.func_make_thumbnail_url(url)
            var img = $('<img src="' + reurl + '"/>')
            var img_w = this.options.ffiler_file_wrap.clone().appendTo(this.wrapper)
            img = img.appendTo(img_w)
            img_w.attr('href', url)
            if (file_data) {
                console.log('Send file data')
                this.upload(file_data, img_w)
            }
            if (this.options.callback_add_item) {
                this.options.callback_add_item.apply(this, [img_w, is_new, url])
            }
        },

        upload: function (file_data, ffiler_object) {
            var form_data = new FormData();
            form_data.append("file", file_data)
            var that = this
            var options = {
                url: this.options.ffiler_upload_url,
                dataType: 'text',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                success: function (res) {
                    if (that.options.callback_postupload) {
                        that.options.callback_postupload.apply(that, [res, ffiler_object])
                    }
                }
            }

            if (this.options.callback_preupload) {
                this.options.callback_preupload.apply(this, [options, ffiler_object])
            }

            $.ajax(options)
        },
        /**
         * Remove item from ffiler.
         *
         * @param {object} jquery_object jQuery selector
         * @this {Plugin} ffiler object
         * @see {ffiler.options.callback_remove_item} - called before detach object
         */
        remove_item: function (jquery_object) {
            if (this.options.callback_remove_item) {
                this.options.callback_remove_item.apply(this, [jquery_object])
            }

            jquery_object.detach()
            this.hide_delete_button()
            this.retarget()

        },

        /**
         * Hide delete button object
         *
         * @this {Plugin} ffiler object
         */
        hide_delete_button: function () {
            this.delete_button.hide()
        },

        make: function (img_wrapper, block_width, inline) {
            var bon = parseInt(img_wrapper.css("margin-left")) + parseInt(img_wrapper.css("margin-right"));
            block_width -= bon * inline
            var img_w = block_width / inline;
            this.targets.css('width', img_w)
            this.targets.css('min-width', img_w)
            this.targets.css('max-width', img_w)
            this.targets.css('height', img_w)
            this.targets.css('min-height', img_w)
            this.targets.css('max-height', img_w)
        }
    };

    $.fn[pluginName] = function (options) {
        return new Plugin(this, options);
    };


})(jQuery);