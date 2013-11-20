from django.views.generic import TemplateView
from django.shortcuts import HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator


class Upload(TemplateView):
    template_name = None
    #@TODO: check perm for model
    @method_decorator(staff_member_required)
    def dispatch(self, *args, **kwargs):
        return super(Upload, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        from django.conf import settings
        from uuid import uuid4
        import os

        file = request.FILES['file']
        ext = file._get_name().split('.')[-1]
        # if ext not in allow:
        #     return HttpResponseNotAllowed('Invalid file extension')
        filename = "%s.%s" % (uuid4(), ext)
        path = os.path.join(settings.MEDIA_ROOT, filename)
        dest = open(path, 'wb+')
        for ch in file.chunks():
            dest.write(ch)
        dest.close()
        return HttpResponse('%s%s' % (settings.MEDIA_ROOT, filename))


class Resize(TemplateView):
    template_name = None

    def get(self, request, *args, **kwargs):
        import Image
        from django.conf import settings
        import os

        path = os.path.join(settings.MEDIA_ROOT, self.kwargs['url'][len(settings.MEDIA_URL) - 1:])
        try:
            im = Image.open(path)
        except IOError:
            return HttpResponse('')
        w, h = im.size
        im.thumbnail((
                         200, 200
                     ), resample=Image.ANTIALIAS)
        res = HttpResponse(mimetype="image/png")
        im.save(res, "png")
        return res
