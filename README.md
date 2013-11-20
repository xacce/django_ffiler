django_ffiler
=============

Django admin inline images + multiupload.
![alt=""](http://xacce.ru/scr/scr_2013-11-20;19:49:56.png)
### Installation
Copy django_ffiler in root project directory.

Add ```django_ffiler``` to ```INSTALLED_APPS``` (settings.php).
Add ```url(r'^', include("django_ffiler.urls")),``` to ```urls.py```


#### Example model:

```
class Content(models.Model):
    title = models.CharField(max_length=200)


class Image(models.Model):
    content = models.ForeignKey(Content)
    image = models.ImageField(upload_to='sub_media/')
```

#### Admin.py
```
from django_ffiler.admin import ImageInlineAdmin


class ContentImages(ImageInlineAdmin):
    model = Image


class ContentAdmin(admin.ModelAdmin):
    inlines = [ContentImages]


admin.site.register(Content, ContentAdmin)
```
