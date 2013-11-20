from django.contrib import admin
from django.db.models.fields.files import ImageField
from django.contrib.admin.widgets import AdminFileWidget



class CustomFileInputWidget(AdminFileWidget):


    def value_from_datadict(self, data, files, name):
        import re
        from django.core.files.uploadedfile import SimpleUploadedFile
        from uuid import uuid4

        left_part, i, right_part = re.search("^(.+?)\-(\d+)\-(.+?)$", name, re.UNICODE).groups()
        url = "%s-%s-url" % (left_part, i)
        id_key = "%s-%s-id" % (left_part, i)
        if id_key in data and data[id_key]:
            return files.get(name, None)

        if url in data:
            try:
                return SimpleUploadedFile("%s.%s" % (str(uuid4()), data[url].split('.')[-1]), file(data[url]).read())
            except IOError:
                return None
        return None

    def render(self, name, value, attrs=None):
        attrs = {'multiple': 'true'}
        return super(CustomFileInputWidget, self).render(name, value, attrs)


class ImageInlineAdmin(admin.StackedInline):
    formfield_overrides = {
        ImageField: {'widget': CustomFileInputWidget}
    }
    extra = 0
    template = u'admin/edit_inline/ffiler.html'

    @property
    def media(self):
        from django import forms
        from django.contrib.admin.templatetags.admin_static import static

        media = super(ImageInlineAdmin, self).media
        js_list = (
            static("ffiler/js/jq.2.0.3.js"),
            static("ffiler/js/jquery.magnific-popup.min.js"),
            static("ffiler/js/ffiler.js"),
            static("ffiler/js/bootstrap.min.js"),
            static("ffiler/js/django_transport.js"),
            static("ffiler/js/jquery.magnific-popup.min.js"),
        )
        css_list = {
            'all': (static('ffiler/css/bootstrap.css'),
                    static('ffiler/css/magnific-popup.css'),
                    static('ffiler/css/ffiler.css'),
            )

        }
        media.add_js(js_list)
        media.add_css(css_list)

        return media