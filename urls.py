from django.conf.urls import patterns, include, url

from django_ffiler.views import Upload,Resize


urlpatterns = patterns('',
                       url(r'^admin/django_ffiler/upload/', Upload.as_view()),
                       url(r'^admin/django_ffiler/crop/(?P<url>.+?)$', Resize.as_view()),
)

